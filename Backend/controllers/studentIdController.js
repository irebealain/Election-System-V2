import StudentId from '../models/studentId.model.js';
import User from '../models/users.model.js';

// Upload student IDs for an election
export const uploadStudentIds = async (req, res) => {
  try {
    const { electionId, studentIds } = req.body;

    if (!electionId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide election ID and an array of student IDs'
      });
    }

    // Check for duplicates in the input
    const uniqueIds = [...new Set(studentIds)];
    if (uniqueIds.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate student IDs found in the input'
      });
    }

    // Check for existing IDs in the database for this election
    const existingIds = await StudentId.find({
      studentId: { $in: studentIds },
      electionId
    }).select('studentId');

    if (existingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some student IDs already exist for this election',
        existingIds: existingIds.map(id => id.studentId)
      });
    }

    // Create new student IDs
    const newStudentIds = studentIds.map(id => ({
      studentId: id.trim(),
      electionId
    }));

    await StudentId.insertMany(newStudentIds);

    res.status(201).json({
      success: true,
      message: 'Student IDs uploaded successfully',
      count: newStudentIds.length
    });
  } catch (error) {
    console.error('Error uploading student IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload student IDs'
    });
  }
};

// Get all student IDs for an election
export const getStudentIds = async (req, res) => {
  try {
    const { electionId } = req.params;

    const studentIds = await StudentId.find({ electionId })
      .populate('usedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: studentIds
    });
  } catch (error) {
    console.error('Error fetching student IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student IDs'
    });
  }
};

// Validate student ID for an election
export const validateStudentId = async (studentId, electionId) => {
  try {
    const validId = await StudentId.findOne({
      studentId: studentId.trim(),
      electionId,
      status: 'available'
    });

    if (!validId) {
      return {
        isValid: false,
        message: 'Invalid student ID or already registered for this election'
      };
    }

    return {
      isValid: true,
      studentId: validId
    };
  } catch (error) {
    console.error('Error validating student ID:', error);
    return {
      isValid: false,
      message: 'Error validating student ID'
    };
  }
};

// Mark student ID as used
export const markStudentIdAsUsed = async (studentId, userId) => {
  try {
    await StudentId.findOneAndUpdate(
      { studentId: studentId.trim() },
      {
        status: 'used',
        usedBy: userId
      }
    );
    return true;
  } catch (error) {
    console.error('Error marking student ID as used:', error);
    return false;
  }
};