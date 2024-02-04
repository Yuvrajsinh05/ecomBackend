const mongoose = require("mongoose");
const FilterSchema = new mongoose.Schema(
    {
        Category: { type: String, required: true, default: "" },
        type: { type: String, default: "" },
        PriceRange: { type: Object, default: null },
        Brands: { type: Object, default: null },
        createdAt: { type: Date, default: Date.now }
    }
)



module.exports = mongoose.model('FilterCounts', FilterSchema);
