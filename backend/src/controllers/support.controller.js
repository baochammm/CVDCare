import SupportRequest from "../models/supportRequest.js";

export const createRequest = async (req, res) => {
  try {
    const request = await SupportRequest.create({
      user: req.user._id,
      message: req.body.message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error creating request" });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await SupportRequest.find({
      user: req.user._id,
    }).sort({ createdAt: 1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await SupportRequest.find()
      .populate("user", "userName email")
      .sort({ createdAt: 1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";

    const query = isAdmin ? { _id: id } : { _id: id, user: req.user._id };
    const request = await SupportRequest.findOneAndDelete(query);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting request" });
  }
};
