import Faculty from '../models/Faculty.js';
import StudentTest from '../models/studentTestModel.js';
import Student from '../models/Student.js';
import Test from '../models/Test.js';
import bcryptjs from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import xlsx from 'xlsx';
import TestQuestions from '../models/testQuestions.js';
import fetch from 'node-fetch';

const sendOtpSms = async (phone, otp) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const msgSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  try {
    if (sid && token && (from || msgSid)) {
      const body = new URLSearchParams();
      if (msgSid) body.append('MessagingServiceSid', msgSid);
      else body.append('From', from);
      const e164 = `+91${String(phone).replace(/\D/g, '').slice(-10)}`;
      body.append('To', e164);
      body.append('Body', `Your OTP is ${otp}`);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
        body
      });
      if (res.ok) return true;
      const t = await res.text();
      console.error('Twilio SMS error', res.status, t);
    }
  } catch (e) {
    console.error('Twilio send error', e.message);
  }
  const textlocalKey = process.env.TEXTLOCAL_API_KEY;
  const textlocalSender = process.env.TEXTLOCAL_SENDER;
  try {
    if (textlocalKey && textlocalSender) {
      const body = new URLSearchParams();
      body.append('apikey', textlocalKey);
      const tl = `91${String(phone).replace(/\D/g, '').slice(-10)}`;
      body.append('numbers', tl);
      body.append('sender', textlocalSender);
      body.append('message', `Your OTP is ${otp}`);
      const res = await fetch('https://api.textlocal.in/send/', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (data && data.status === 'success') return true;
      console.error('Textlocal SMS error', data);
    }
  } catch (e) {
    console.error('Textlocal send error', e.message);
  }
  return false;
};

const normalizeIndianPhone = (value) => {
  const d = String(value || '').replace(/\D/g, '');
  if (!d) return '';
  return d.endsWith(d.slice(-10)) ? d.slice(-10) : d.slice(-10);
};

const startTwilioVerify = async (phone) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  try {
    if (sid && token && serviceSid) {
      const e164 = `+91${String(phone).replace(/\D/g, '').slice(-10)}`;
      const body = new URLSearchParams();
      body.append('To', e164);
      body.append('Channel', 'sms');
      const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
        method: 'POST',
        headers: { 
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });
      if (res.ok) return true;
      const t = await res.text();
      console.error('Twilio Verify start error', res.status, t);
    }
  } catch (e) {
    console.error('Twilio Verify start exception', e.message);
  }
  return false;
};

const checkTwilioVerify = async (phone, code) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  try {
    if (sid && token && serviceSid) {
      const e164 = `+91${String(phone).replace(/\D/g, '').slice(-10)}`;
      const body = new URLSearchParams();
      body.append('To', e164);
      body.append('Code', String(code));
      const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
        method: 'POST',
        headers: { 
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });
      if (res.ok) {
        const data = await res.json();
        return String(data.status || '').toLowerCase() === 'approved';
      }
      const t = await res.text();
      console.error('Twilio Verify check error', res.status, t);
    }
  } catch (e) {
    console.error('Twilio Verify check exception', e.message);
  }
  return false;
};
export const registerFaculty = async (req, res) => {
    try {
        const { name, email, password, department, phone } = req.body;

        // Validate Indian phone number in E.164 style +91XXXXXXXXXX
        if (!/^\+91\d{10}$/.test(String(phone))) {
            return res.status(400).json({ message: 'Phone must be in format +91 followed by 10 digits' });
        }
        const normalizedPhone = normalizeIndianPhone(phone);

        // Convert department to uppercase to match enum values
        const normalizedDepartment = department.toUpperCase();
        
        // Convert email to lowercase
        const normalizedEmail = email.toLowerCase();

        // Hash password directly here instead of relying on middleware
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create and save faculty with hashed password
        const faculty = await Faculty.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            department: normalizedDepartment,
            phone: normalizedPhone,
            isActive: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Faculty registered successfully!",
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Registration failed", 
                errors: messages 
            });
        }
        
        // Handle duplicate key errors (email or phone)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `This ${field} is already registered` 
            });
        }

        res.status(500).json({ message: "Registration failed" });
    }
};

export const loginFaculty = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Add request logging
        console.log('Login attempt details:', {
            attemptedEmail: email,
            normalizedEmail: email.toLowerCase().trim()
        });

        // Find faculty without select('+password') since we removed select: false
        const faculty = await Faculty.findOne({
            email: email.toLowerCase().trim()
        });
        
        // Log the query result (without sensitive data)
        console.log('Faculty search result:', {
            found: faculty ? 'Yes' : 'No',
            email: email.toLowerCase().trim()
        });
        
        if (!faculty) {
            console.log('No faculty found with email:', email.toLowerCase().trim());
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare passwords using the schema method
        const isMatch = await faculty.comparePassword(password);
        console.log('Password verification:', isMatch ? 'Success' : 'Failed');

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update last login time
        faculty.lastLogin = new Date();
        await faculty.save();

        // Generate token
        const token = jwt.sign(
            { 
                id: faculty._id, 
                role: 'faculty',
                email: faculty.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
            }
        });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            message: "Server error during login" 
        });
    }
};

export const getFacultyProfile = async (req, res) => {
    try {
        console.log('Attempting to fetch faculty profile for user ID:', req.user.id);
        const faculty = await Faculty.findById(req.user.id)
            .select('-password')
            .populate('createdTests', 'title className section timeLimit');
        
        if (!faculty) {
            console.log('Faculty not found for ID:', req.user.id);
            return res.status(404).json({ message: "Faculty not found" });
        }
        
        console.log('Faculty profile found, sending response.');
        res.status(200).json(faculty);
    } catch (error) {
        console.error('Error fetching faculty profile:', error);
        res.status(500).json({ message: error.message });
    }
};

// List all completed student results for faculty view
export const getAllStudentResults = async (req, res) => {
  try {
    // Only show results for tests created by the logged-in faculty
    const ownedTests = await Test.find({ createdBy: req.user.id }).select('_id');
    const ownedTestIds = ownedTests.map(t => t._id);

    const results = await StudentTest.find({ status: 'completed', testId: { $in: ownedTestIds } })
      .sort({ completedAt: -1 })
      .populate({ path: 'studentId', model: Student, select: 'name email rollNo className' })
      .populate({ path: 'testId', model: Test, select: 'title testName totalMarks startTime' });

    const formatted = results.map((r) => ({
      _id: r._id,
      student: r.studentId ? {
        name: r.studentId.name,
        email: r.studentId.email,
        rollNo: r.studentId.rollNo,
        className: r.studentId.className,
        id: r.studentId._id,
      } : null,
      test: r.testId ? {
        id: r.testId._id,
        title: r.testId.title || r.testId.testName || 'Test',
        totalMarks: r.testId.totalMarks || r.totalMarks,
        startTime: r.testId.startTime,
      } : null,
      totalMarks: r.totalMarks,
      marksObtained: r.marksObtained,
      percentage: r.percentage,
      completedAt: r.completedAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results', error: error.message });
  }
};

export const getStudentResultsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Restrict to tests owned by the logged-in faculty
    const ownedTests = await Test.find({ createdBy: req.user.id }).select('_id');
    const ownedTestIds = ownedTests.map(t => t._id);

    const results = await StudentTest.find({ studentId, status: 'completed', testId: { $in: ownedTestIds } })
      .sort({ completedAt: -1 })
      .populate({ path: 'studentId', model: Student, select: 'name email rollNo className' })
      .populate({ path: 'testId', model: Test, select: 'title testName totalMarks startTime' });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student results', error: error.message });
  }
};

export const getStudentTestResultByStudentAndTest = async (req, res) => {
  try {
    const { studentId, testId } = req.params;
    // Ensure the requested test is owned by the logged-in faculty
    const test = await Test.findById(testId).select('createdBy title duration totalMarks startTime');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    if (String(test.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: not the owner of this test' });
    }
    const result = await StudentTest.findOne({ studentId, testId })
      .populate({ path: 'testId', model: Test, select: 'title duration totalMarks startTime createdBy' });
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    const answers = result.answers || [];
    const correctCount = answers.filter(a => a.isCorrect).length;
    const incorrectCount = answers.length - correctCount;
    const accuracyRate = answers.length ? (correctCount / answers.length) * 100 : 0;
    const testInfo = result.testId || {};
    const formatted = {
      _id: result._id,
      studentId: result.studentId,
      testId: result.testId,
      answers: result.answers,
      totalMarks: result.totalMarks || test.totalMarks,
      marksObtained: result.marksObtained,
      percentage: result.percentage,
      status: result.status,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      timeTaken: result.timeTaken,
      correctCount,
      incorrectCount,
      accuracyRate,
      totalQuestions: answers.length,
      testTitle: test.title || test.testName || 'Test',
      testDuration: test.duration || 0
    };
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result', error: error.message });
  }
};
 
export const updateFacultyProfile = async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            phone,
            department,
            country,
            city,
            pinCode,
            profilePicture
        } = req.body;

        const faculty = await Faculty.findById(req.user.id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Update all fields if provided
        if (name) faculty.name = name;
        if (username) faculty.username = username;
        if (email) faculty.email = email;
        if (phone) faculty.phone = phone;
        if (department) faculty.department = department;
        if (country) faculty.country = country;
        if (city) faculty.city = city;
        if (pinCode) faculty.pinCode = pinCode;
        if (profilePicture) faculty.profilePicture = profilePicture;

        await faculty.save();

        res.status(200).json({
            message: "Profile updated successfully",
            faculty
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const createClass = async (req, res) => {
    try {
        const { className, section } = req.body;
        // Implementation for creating class
        res.status(201).json({ message: "Class created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTest = async (req, res) => {
    try {
        const { title, className, section, timeLimit } = req.body;
        const test = new Test({
            title,
            className,
            section,
            timeLimit,
            createdBy: req.user.id
        });
        await test.save();
        res.status(201).json({ message: "Test created successfully", test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadQuestions = async (req, res) => {
  try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { testId } = req.body;
        if (!testId) {
            return res.status(400).json({ message: "testId is required" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const normalized = data.map((q) => {
            const lower = Object.keys(q || {}).reduce((acc, k) => { acc[k.trim().toLowerCase()] = q[k]; return acc; }, {});
            const rawMarks = q.marks ?? q.Marks ?? q.TotalMarks ?? lower['marks'] ?? lower['totalmarks'] ?? lower['total marks'] ?? lower['mark'] ?? lower['score'];
            const parsedMarks = Number(rawMarks);
            const safeMarks = Number.isFinite(parsedMarks) && parsedMarks > 0 ? parsedMarks : 1;
            return {
                testId,
                question: (q.question || q.Question || lower['question'] || '').toString().trim(),
                options: [q.optionA || q.OptionA || lower['optiona'], q.optionB || q.OptionB || lower['optionb'], q.optionC || q.OptionC || lower['optionc'], q.optionD || q.OptionD || lower['optiond']].map((o) => (o ?? '').toString().trim()),
                correctAnswer: q.correctAnswer || q.CorrectAnswer || lower['correctanswer'],
                marks: safeMarks
            };
        });

        const bulkOps = normalized.map((q) => ({
            updateOne: {
                filter: { testId: q.testId, question: q.question },
                update: { $set: { options: q.options, correctAnswer: q.correctAnswer, marks: q.marks } },
                upsert: true
            }
        }));

        const bulkRes = await TestQuestions.bulkWrite(bulkOps);
        const upserted = bulkRes.upsertedCount || 0;
        const modified = bulkRes.modifiedCount || 0;

        try {
            const mongoose = (await import('mongoose')).default;
            const agg = await TestQuestions.aggregate([
                { $match: { testId: new mongoose.Types.ObjectId(String(testId)) } },
                { $group: { _id: null, total: { $sum: '$marks' } } }
            ]);
            const computedTotal = Number(agg?.[0]?.total || 0);
            await Test.findByIdAndUpdate(String(testId), { totalMarks: computedTotal });
        } catch (_) {}

        res.status(200).json({ message: "Questions uploaded successfully", summary: { upserted, modified } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeFacultyPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const isMatch = await faculty.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash and set new password
    const salt = await bcryptjs.genSalt(10);
    faculty.password = await bcryptjs.hash(newPassword, salt);
    await faculty.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestFacultyPasswordResetOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!/^\+91\d{10}$/.test(String(phone))) {
      return res.status(400).json({ message: 'Phone must be in format +91 followed by 10 digits' });
    }
    const normalizedPhone = normalizeIndianPhone(phone);
    if (email && (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!normalizedPhone || !/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: 'Valid 10-digit phone is required' });
    }
    let faculty;
    if (email) {
      faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
      if (!faculty) {
        return res.status(404).json({ message: 'Account not found for this email' });
      }
      if (String(faculty.phone) !== String(normalizedPhone)) {
        return res.status(400).json({ message: 'Phone does not match the registered number for this email' });
      }
    } else {
      faculty = await Faculty.findOne({ phone: normalizedPhone });
    }
    if (!faculty) {
      return res.status(404).json({ message: 'Account not found for this phone' });
    }
    const verifyService = String(process.env.TWILIO_VERIFY_SERVICE_SID || '');
    let otp;
    if (!verifyService) {
      otp = String(Math.floor(100000 + Math.random() * 900000));
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(otp, salt);
      faculty.resetOtpHash = hash;
    } else {
      faculty.resetOtpHash = null;
    }
    faculty.resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    faculty.resetOtpAttempts = 0;
    faculty.resetOtpVerified = false;
    await faculty.save();
    if (verifyService) {
      const started = await startTwilioVerify(normalizedPhone);
      if (!started) {
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      return res.status(200).json({ message: 'OTP sent to registered phone' });
    } else {
      const shouldExposeOtp = String(process.env.OTP_DEBUG_DISPLAY || '').toLowerCase() === 'true';
      const twilioConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID));
      const textlocalConfigured = Boolean(process.env.TEXTLOCAL_API_KEY && process.env.TEXTLOCAL_SENDER);
      const hasSmsProvider = twilioConfigured || textlocalConfigured;
      if (shouldExposeOtp) {
        return res.status(200).json({ message: 'OTP generated', otpPreview: otp });
      }
      if (!hasSmsProvider) {
        return res.status(500).json({ message: 'SMS service not configured' });
      }
      const sent = await sendOtpSms(normalizedPhone, otp);
      if (!sent) {
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      return res.status(200).json({ message: 'OTP sent to registered phone' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error generating OTP', error: error.message });
  }
};

export const lookupFacultyRegisteredPhoneByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });
    if (!faculty) {
      return res.status(404).json({ message: 'Account not found for this email' });
    }
    const phone = String(faculty.phone || '');
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Registered phone is invalid' });
    }
    const prefix = phone.slice(0, 2);
    const suffix = phone.slice(7, 10);
    const maskedPhone = `${prefix}*${suffix}`;
    res.status(200).json({ maskedPhone, prefix, suffix, email: faculty.email });
  } catch (error) {
    res.status(500).json({ message: 'Error looking up email', error: error.message });
  }
};

export const verifyFacultyPasswordResetOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }
    if (!/^\+91\d{10}$/.test(String(phone))) {
      return res.status(400).json({ message: 'Phone must be in format +91 followed by 10 digits' });
    }
    const normalizedPhone = normalizeIndianPhone(phone);
    const faculty = await Faculty.findOne({ phone: normalizedPhone });
    if (!faculty || !faculty.resetOtpExpiresAt) {
      return res.status(400).json({ message: 'No active OTP. Request a new one.' });
    }
    if (new Date() > new Date(faculty.resetOtpExpiresAt)) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (faculty.resetOtpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });
    }
    const verifyService = String(process.env.TWILIO_VERIFY_SERVICE_SID || '');
    let ok = false;
    if (verifyService) {
      ok = await checkTwilioVerify(normalizedPhone, otp);
    } else {
      ok = await bcryptjs.compare(String(otp), faculty.resetOtpHash);
    }
    faculty.resetOtpAttempts = (faculty.resetOtpAttempts || 0) + 1;
    if (!ok) {
      await faculty.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    faculty.resetOtpVerified = true;
    await faculty.save();
    const token = jwt.sign(
      { id: faculty._id, role: 'faculty', purpose: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '10m' }
    );
    res.status(200).json({ message: 'OTP verified', resetToken: token });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

export const resetFacultyPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    let decoded;
    try {
      decoded = jwt.verify(resetToken, jwtSecret);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }
    if (decoded.purpose !== 'password_reset' || decoded.role !== 'faculty') {
      return res.status(401).json({ message: 'Invalid reset token' });
    }
    const faculty = await Faculty.findById(decoded.id);
    if (!faculty || !faculty.resetOtpVerified) {
      return res.status(400).json({ message: 'OTP not verified' });
    }
    const salt = await bcryptjs.genSalt(10);
    faculty.password = await bcryptjs.hash(newPassword, salt);
    faculty.resetOtpHash = null;
    faculty.resetOtpExpiresAt = null;
    faculty.resetOtpAttempts = 0;
    faculty.resetOtpVerified = false;
    await faculty.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
