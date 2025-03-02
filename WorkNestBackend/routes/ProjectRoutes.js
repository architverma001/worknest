const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMembersToProject,
  removeTeamMemberFromProject,
  updateProjectStatus,
  updatePaidAmount,
} = require("../controllers/ProjectController");

// ✅ Project CRUD Operations
router.post("/add", createProject);      // Create a new project
router.get("/", getProjects);               // Get all projects
router.get("/:id", getProjectById);         // Get a project by ID
router.put("/update/:id", updateProject);   // Update project details
router.delete("/delete/:id", deleteProject);// Delete a project

// ✅ Project Modifications
router.put("/:projectId/add-team-members", addTeamMembersToProject);   // Add team members to a project
router.put("/:projectId/remove-team-member/:memberId", removeTeamMemberFromProject); // Remove a team member
router.put("/:projectId/update-status", updateProjectStatus);         // Update project status
router.put("/:projectId/update-paid-amount", updatePaidAmount);       // Update paid amount

module.exports = router;
