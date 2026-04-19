import mongoose from "mongoose";

export interface IDeleveryAssignment {
    _id: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    broadcastedTo: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    status: "broadcasted" | "assigned" | "completed";
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeleveryAssignment>(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        broadcastedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["broadcasted", "assigned", "completed"], default: "broadcasted" },
        acceptedAt: { type: Date },
    },
    { timestamps: true }
);

export const DeliveryAssignment = mongoose.models.DeliveryAssignment || mongoose.model<IDeleveryAssignment>("DeliveryAssignment", deliveryAssignmentSchema);

