module.exports = otpGenerator = () => {
    return parseInt(
        (Math.floor(100000 + Math.random() * 900000))
    );
};
