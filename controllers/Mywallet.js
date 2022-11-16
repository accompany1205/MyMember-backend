
const MyWalletModal = require('../models/Mywallet')
// add amount
exports.depositAmount = async (req, res) => {

    let { user_id, wallet, cretits } = req.body;
    console.log("req.body", user_id, wallet)
    try {
        const doesUserExist = await MyWalletModal.findOne({ user_id: user_id });
        console.log('findUser', doesUserExist)
        if (doesUserExist) {

            let creditsInfo = await MyWalletModal.findByIdAndUpdate(doesUserExist._id, {
                $inc: {
                    wallet: wallet
                    // , cretits: cretits
                }
            }, {
                new: true,
                runValidators: true
            })
            res.status(200).json({
                success: true,
                data: creditsInfo
            })
        }
        else {
            MyWalletModal(req.body).save()
                .then((item) => res.json({ success: true, data: item }))

        }
        // MyWalletModal(req.body).save()
        // .then((item) => res.json({ success: true, data: item }))

    } catch (e) {
        res.json({ success: false, data: "Something went wrong" })
        console.log("ee", e)
    }
}
// remove amount
exports.withdrawAmount = async (req, res) => {
    let { user_id, wallet, cretits } = req.body;
    console.log("req.body", user_id, wallet)
    try {
        const doesUserExist = await MyWalletModal.findOne({ user_id: user_id });
        console.log('findUser', doesUserExist)
        if (doesUserExist) {
            // let findUser = await MyWalletModal.findById({user_id})
            // console.log('findUser', findUser)
            let creditsInfo = await MyWalletModal.findByIdAndUpdate(doesUserExist._id, { $inc: { wallet: -wallet, cretits: cretits } }, {
                new: true,
                runValidators: true
            })
            res.status(200).json({
                success: true,
                data: creditsInfo
            })
        }
        else {
            MyWalletModal(req.body).save()
                .then((item) => res.json({ success: true, data: item }))

        }
    } catch (e) {
        res.json({ success: false, data: "Something went wrong" })
        console.log("ee", e)
    }

}
exports.withdrawAmountForBuyingNumber = async (req, res) => {
    let { user_id, wallet, cretits } = req.body;
    console.log("req.body", user_id, wallet)
    try {
        const doesUserExist = await MyWalletModal.findOne({ user_id: user_id });
        console.log('findUser', doesUserExist)
        if (doesUserExist) {
            // let findUser = await MyWalletModal.findById({user_id})
            // console.log('findUser', findUser)
            let creditsInfo = await MyWalletModal.findByIdAndUpdate(doesUserExist._id, { $inc: { wallet: -wallet, } }, {
                new: true,
                runValidators: true
            })
            res.status(200).json({
                success: true,
                data: creditsInfo
            })
        }
        else {
            MyWalletModal(req.body).save()
                .then((item) => res.json({ success: true, data: item }))

        }
    } catch (e) {
        res.json({ success: false, data: "Something went wrong" })
        console.log("ee", e)
    }

}
exports.balanceInfo = async (req, res) => {
    let { user_id, } = req.body;
    console.log("user id", user_id)
    try {
        const doesUserExist = await MyWalletModal.findOne({ user_id: user_id });

        if (doesUserExist) {
            let creditsInfo = await MyWalletModal.findByIdAndUpdate({ _id: doesUserExist._id })

            res.status(200).json({
                success: true,
                data: creditsInfo
            })
        }
        else {
            res.json({ success: false, data: "Something went wrong" })
            console.log("ee", e)

        }

    }
    catch (e) {
        console.log("error", e)
    }
}

exports.getbalanceInfo = async (req, res) => {
    console.log('call here');
    let { user_id } = req.params;
    try {
        let getBalance = await MyWalletModal.findOne({ user_id: user_id })
        if (getBalance) {
            res.status(200).json({
                success: true,
                data: getBalance
            })
        } else {
            res.json({ success: false, data: "Something went wrong" })
        }
    } catch (e) {
        console.log('e', e)
    }
}