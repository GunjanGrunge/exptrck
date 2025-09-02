---
applyTo: '**'
---
we need to build a frontend using nextjs and tailwind css to keep track of monthly expenses.

The user should be able to plan his expenses as per the dates of the month for paying EMI, rent etc.
The user should be able to add, edit, and delete expenses as needed.
User should enter his income from various sources and allocate the expenses accordingly for the sources.
For the emis (Equated Monthly Installments), the user should be able to specify the amount, due date, and total number of emis remaining or new emis to be added. The total number of remaining emis should be calculated and displayed to the user as per the current date. eg: if a emi starts in Jan which is for 12 months when the user opens the application in March, it should show 10 remaining emis.

egxample: 

ITEMS	AMOUNT	DATE TO  PAY
Maid + Carwash	 ₹ 5,500.00 	2
MOM	 ₹ 5,000.00 	2
Bajaj	 ₹ 53,817.00 	2
Kbee + Shiba	 ₹ 50,273.00 	2
GL	 ₹ 4,000.00 	5
Car	 ₹ 22,534.00 	5
bike	 ₹ 10,600.00 	6
Car 2	 ₹ 7,950.00 	10
Sachin	 ₹ 18,000.00 	10
Total 	 ₹ 1,77,674.00 	
Salary 	 ₹ 1,92,000.00 	
Balance		 ₹ 14,326.00 

Total EMI
 ₹ 1,49,174.00 

The user should also be able to add multiple EMIs on a credit card  and the total and summary of the same should be displayed to the user 

create a login page for the user  and we will use Authentication with Clerk, we will deploy this in vercel as a single page application

We also need to make sure the user can manage their expenses effectively by providing features such as adding, editing, and deleting expenses, as well as viewing their expense history.
The user should be able to add total limit and the used amount or add any expenses for each credit card so that the user can track total amount used and available for the same.
The user should be able to add expenses such as transfer and should be able to specify the source and the destination of the transfer.
The user should be able to download a PDF format statement for any selected date range with both income and expenses details with the source and destination specified.


Color Palette:
Walden Pond : #759ab7
Burnt sienna: #ce6e55
squid ink : #04132a