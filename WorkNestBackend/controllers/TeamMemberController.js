const TeamMember = require("../models/TeamMember");

// ✅ Add a new team member
const addTeamMember = async (req, res) => {
  try {
    const { name, phone, email, role, totalAmount, paidAmount, lastPaymentDate } = req.body;

    const newMember = new TeamMember({ name, phone, email, role, totalAmount, paidAmount, lastPaymentDate });
    await newMember.save();

    res.status(201).json({ message: "Team member added successfully", teamMember: newMember });
  } catch (error) {
    res.status(500).json({ message: "Error adding team member", error: error.message });
  }
};

// ✅ Remove a team member
const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await TeamMember.findByIdAndDelete(id);
    if (!deletedMember) return res.status(404).json({ message: "Team member not found" });

    res.status(200).json({ message: "Team member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing team member", error: error.message });
  }
};

// ✅ Update team member details
const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedMember = await TeamMember.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedMember) return res.status(404).json({ message: "Team member not found" });

    res.status(200).json({ message: "Team member updated successfully", teamMember: updatedMember });
  } catch (error) {
    res.status(500).json({ message: "Error updating team member", error: error.message });
  }
};

// ✅ Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team members", error: error.message });
  }
};

// ✅ Get team member by ID
const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findById(id);
    if (!teamMember) return res.status(404).json({ message: "Team member not found" });

    res.status(200).json(teamMember);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team member", error: error.message });
  }
};

module.exports = {
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  getAllTeamMembers,
  getTeamMemberById
};
