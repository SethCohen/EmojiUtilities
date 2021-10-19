const implies = (p, q) => {
    // p -> q
    if (p) {
        return q;
    } else {
        return true;
    }
}


module.exports = {
    implies,
}