const Project = require("../models/Project");
const TeamMember = require("../models/TeamMember");

// ✅ Create a new project
const createProject = async (req, res) => {
  try {
    const { name, totalBudget, startDate, endDate, teamMembers, status } = req.body;

    // Validate team members
    const validMembers = await TeamMember.find({ _id: { $in: teamMembers } });
    if (validMembers.length !== teamMembers.length) {
      return res.status(400).json({ message: "Invalid team members" });
    }

    const project = new Project({ name, totalBudget, startDate, endDate, teamMembers, status });
    await project.save();

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

// ✅ Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("teamMembers", "name email role");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

// ✅ Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("teamMembers", "name email role");
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

// ✅ Update a project
const updateProject = async (req, res) => {
  try {
    const { totalPaid, teamMembers, ...rest } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (totalPaid !== undefined) {
      project.totalPaid = totalPaid;
      project.totalPending = project.totalBudget - totalPaid;
    }

    if (teamMembers) {
      const validMembers = await TeamMember.find({ _id: { $in: teamMembers } });
      if (validMembers.length !== teamMembers.length) {
        return res.status(400).json({ message: "Invalid team members" });
      }
      project.teamMembers = teamMembers;
    }

    Object.assign(project, rest);
    await project.save();

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};

// ✅ Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};

// ✅ Add team members to a project
const addTeamMembersToProject = async (req, res) => {
  try {
    const { projectId } = req.params;  // Getting project ID from URL params
    const { name, phone, email, role, totalAmount, paidAmount, lastPaymentDate } = req.body;  // Extracting team member data

    // Check if team member data is provided
    if (!name || !phone || !email || !role || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetch the project from the database
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if a TeamMember with the same email or phone already exists in the database
    const isDuplicateInProject = project.teamMembers.some(
      (existingMember) =>
        existingMember.email === email || existingMember.phone === phone
    );

    if (isDuplicateInProject) {
      return res.status(406).json({
        message: `Member with email ${email} or phone ${phone} already exists in the project.`,
      });
    }

    const existingMember = await TeamMember.findOne({
      $or: [
        { email: email },
        { phone: phone }
      ]
    });



    // If no duplicate is found, create a new team member and save to DB
 // Save the new team member to the database

    // Add the new member's ObjectId to the project's teamMembers array
    project.teamMembers.push(existingMember);

    // Save the project with the updated teamMembers array
    await project.save();

    // Send success response with the updated project
    res.status(200).json({
      message: "Team member added successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding team member to project",
      error: error.message,
    });
  }
};


// ✅ Remove a team member from a project
const removeTeamMemberFromProject = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.teamMembers = project.teamMembers.filter(member => member.toString() !== memberId);
    await project.save();

    res.status(200).json({ message: "Team member removed successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error removing team member", error: error.message });
  }
};

// ✅ Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project status updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating project status", error: error.message });
  }
};

// ✅ Update paid amount and adjust pending amount
const updatePaidAmount = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amountPaid } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.totalPaid += amountPaid;
    project.totalPending = project.totalBudget - project.totalPaid;
    await project.save();

    res.status(200).json({ message: "Paid amount updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating paid amount", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMembersToProject,
  removeTeamMemberFromProject,
  updateProjectStatus,
  updatePaidAmount,
};
