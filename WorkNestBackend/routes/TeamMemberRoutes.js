const express = require("express");
const router = express.Router();
const {
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  getAllTeamMembers,
  getTeamMemberById
} = require("../controllers/TeamMemberController");

// ✅ Add a team member
router.post("/add", addTeamMember);

// ✅ Get all team members
router.get("/all", getAllTeamMembers);

// ✅ Get a team member by ID
router.get("/:id", getTeamMemberById);

// ✅ Update team member details
router.put("/update/:id", updateTeamMember);

// ✅ Remove a team member
router.delete("/remove/:id", removeTeamMember);

module.exports = router;
