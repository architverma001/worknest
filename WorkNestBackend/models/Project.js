const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    teamMembers: [],
    status: {
      type: String,
      enum: ["Pending", "Active", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Calculate totalPending before saving
projectSchema.pre("save", function (next) {
  this.totalPending = this.totalBudget - this.totalPaid;
  next();
});

module.exports = mongoose.model("Project", projectSchema);
