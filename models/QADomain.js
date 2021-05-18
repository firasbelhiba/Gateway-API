const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DomainSchema = new Schema({
    name: {
        type: String,
    },
    icon: {
        type: String,
    },
    tags: {
        type: Array,
    }
});

module.exports = QADomain = mongoose.model("domain", DomainSchema);
