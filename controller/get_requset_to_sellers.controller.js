const promotion_requests = require("../models/Promotion_requests_for_salesperson");

const get_requset_sellers = async (req, res) => {
  try {
    // Number of requests per page
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Page number
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    // Calculate number of requests to skip
    const skip = (page - 1) * limit;

    const all_requests = await promotion_requests
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Total number of promotion requests
    const totalRequests = await promotion_requests.estimatedDocumentCount();

    const totalPages = Math.ceil(totalRequests / limit);

    // No requests found
    if (all_requests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "not found",
        data: [],
        pagination: {
          page,
          limit,
          totalRequests,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "get promotion requests successfully",
      data: all_requests,
      pagination: {
        page,
        limit,
        totalRequests,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (e) {
    console.log(e.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};

module.exports = get_requset_sellers;