const express = require('express');
const router = express.Router();
const {
	fetchAllCC,
	expenseStateByCategory,
	expenseMonthlyCompare,
	todaysExpense,
	weeklyExpense,
	MonthlyExpense,
	thisYearExpense,
} = require('../controllers/finance_info');
const { requireSignin, isAuth, verifySchool } = require('../controllers/auth');

router.get('/finance/fetch-all-cc/:userId', requireSignin, fetchAllCC);
router.get(
	'/finance/expense-state/:userId',
	requireSignin,
	expenseStateByCategory
);

router.get(
	'/finance/expense-monthly-compare/:userId',
	requireSignin,
	expenseMonthlyCompare
);

router.get('/finance/expense-today/:userId', requireSignin, todaysExpense);
router.get('/finance/expense-weekly/:userId', requireSignin, weeklyExpense);
router.get('/finance/expense-monthly/:userId', requireSignin, MonthlyExpense);
router.get('/finance/expense-yearly/:userId', requireSignin, thisYearExpense);

module.exports = router;
