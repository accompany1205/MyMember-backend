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
	expenseReportWithFilter,
	expenseCategoryAdd,
	expenseAdd,
	// Income
	todaysIncome,
	weeklyIncome,
	MonthlyIncome,
	thisYearIncome,
	IncomeReportWithFilters,
	PnlReportGenerateExpense,
	PnlReportGenerateMembership,
	PnlReportGenerateProductSale,
} = require('../controllers/finance_info');
const upload = require('../handler/multer');

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
router.get(
	'/finance/expense-report/:userId',
	requireSignin,
	expenseReportWithFilter
);

// add category
router.get(
	'/finance/expense-category-add/:userId',
	requireSignin,
	expenseCategoryAdd
);
// Add Expense

router.post(
	'/finance/expense-category-add/:userId',
	requireSignin,
	upload.single('expense_image'),
	expenseAdd
);

//////////////////////////////////////////////////////////
/////////////////////// Income ///////////////////////////

router.get('/finance/income-today/:userId', requireSignin, todaysIncome);
router.get('/finance/income-weekly/:userId', requireSignin, weeklyIncome);
router.get('/finance/income-monthly/:userId', requireSignin, MonthlyIncome);
router.get('/finance/income-yearly/:userId', requireSignin, thisYearIncome);
router.get(
	'/finance/income-report/:userId',
	requireSignin,
	IncomeReportWithFilters
);

router.get(
	'/finance/pnl-expense-report/:userId',
	requireSignin,
	PnlReportGenerateExpense
);

router.get(
	'/finance/pnl-membership-report/:userId',
	requireSignin,
	PnlReportGenerateMembership
);

router.get(
	'/finance/pnl-product-sale-report/:userId',
	requireSignin,
	PnlReportGenerateProductSale
);

module.exports = router;
