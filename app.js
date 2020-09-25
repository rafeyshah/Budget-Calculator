var budgetController= (function () {
    
    var Expense = function (type,des,value) {
        this.type=type;
        this.des=des;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPer= function(totalInc){
        if(totalInc>0){
            this.percentage = Math.round((this.value/totalInc)*100);
        }else{
            this.percentage = -1;
        }
    }
    Expense.prototype.getPer = function(){
        return this.percentage;
    }
    var Income = function (type,des,value) {
        this.type=type;
        this.des=des;
        this.value=value;
    }
    var addTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum+= cur.value;
        });
        data.total[type] = sum;
    }

    var data= {
        allItems:{
            exp:[],
            inc:[]
        },
        total:{
            exp:0,
            inc:0
        },
        budget : 0,
        percentage : -1
    };
    

    return{
        addItem: function(type,des,value) {
            var newItem,ID;
        
        // Created new ID
        if(data.allItems[type].length>0){    
        ID = parseInt([data.allItems[type].length-1]) + 1;
    }
        else {
            ID = 0;
        }
        
        // Created new Item based upon exp or inc
        if(type==='exp'){
            newItem = new Expense(ID,des,value);
        }
        else if(type==='inc'){
            newItem = new Income(ID,des,value);
        }

        //Push it into Data Structure
        data.allItems[type].push(newItem);     
        
        return newItem;   
    },
    deleteItem: function(type,id){

        var ID,Index;
        //id=2
        //ID = [0,1,2,3,4] index=2 Somehow we delete or do some thing it'll be 
        //ID = [0,2,3,4] index=1 Now Index changes for that purpose

        ID = data.allItems[type].map(function (current) {
            return current.type; //obj.type Income/Expense
        }); //map() method calls the provided function once for each element in an array
        console.log(ID);
        Index = ID.indexOf(id);
        console.log(Index);
        if(Index !== -1){
            data.allItems[type].splice(Index,1);
        }
    },
    calcBudg: function () {
        // Calculate total income & expense
        addTotal('inc');
        addTotal('exp');

        // Calculate Budget
        data.budget =  data.total.inc - data.total.exp;

        // Calculate Percentage
        if(data.total.inc>0){
        data.percentage = Math.round((data.total.exp/data.total.inc)*100);
    }else{
        data.percentage = -1;
    }
} ,
    calcPercentage: function() {
        /* 
        a=10;
        b=20
        a = (a/income)*100  b=(b/income)*100
        */
       data.allItems.exp.forEach(function(cur){
        cur.calcPer(data.total.inc);
       });
    },
    getPercentage:function(){
           var allPer =  data.allItems.exp.map(function(cur){
               return cur.getPer();
           }) ;
           return allPer;
    },
    getBudget : function () {
        return{
        budget : data.budget,
        percentage: data.percentage,
        inc: data.total.inc,
        exp: data.total.exp
    }
    },
       testing : function(){
           console.log(data);
       }
}
})();



var UIcontroller= (function () {
    
    var DOMstring = {
        type : '.add__type',
        des : '.add__description',
        value : '.add__value',
        button : '.add__btn',
        income : '.income__list',
        expense: '.expenses__list',
        labelBudget: '.budget__value',
        labelIncome: '.budget__income--value',
        labelExpense: '.budget__expenses--value',
        labelPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensePer: '.item__percentage',
        labelDate: '.budget__title--month'
    }

    var formatNumber = function(num,type){
        var numSplit,int,dec;
        num = Math.abs(num);
        num = num.toFixed(2); //round off 23.428 to 23.43

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length>3){//23560 == 23,560
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
        }

        dec = numSplit[1];
        return (type==='inc'? '+':'-')+ ' ' +int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length ;i++){
            callback(list[i],i);
        }
    };

    return{
        getInput : function () {
            return{
            type: document.querySelector(DOMstring.type).value, // inc or exp
            des: document.querySelector(DOMstring.des).value,
            value: parseFloat( document.querySelector(DOMstring.value).value)
        }},
        dom: function () {
            return DOMstring;
        },
        clearField: function () {
            var arr,arrList;
            arr = document.querySelectorAll(DOMstring.des + ", "+ DOMstring.value);
            arrList =  Array.prototype.slice.call(arr); //Converting list into array
            arrList.forEach(function (current,index,arr) {
                current.value="";
            });
            arrList[0].focus();
        },
        delItems:function (itemID) {
            
            var el = document.getElementById(itemID);
            el.parentNode.removeChild(el);
        },
        addItemUI: function (obj,type) {
            var Html,newHtml,element;
            // Create PlaceHolder String
            if (type==='inc'){
                element= DOMstring.income;
                Html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type==='exp'){
                element=DOMstring.expense;
                Html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }
            //Replace The PlaceHolder String
            newHtml = Html.replace('%id%',obj.type);
            newHtml= newHtml.replace('%des%',obj.des);
            newHtml= newHtml.replace('%value%',formatNumber( obj.value,type));

            //Insert HTML to Dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        displayPer: function(per){
            var field = document.querySelectorAll(DOMstring.expensePer); //returns NodeList

            // Trick to convert nodelist to array
            

            nodeListForEach(field,function(cur,index){
                if(per[index]>0){
                    cur.textContent = per[index] + '%';}
                else{
                    cur.textContent = '---';
                }
            });
        },
        displayBudget: function(obj){

            var type;
            obj.budget>0 ? type = 'inc' : type='exp';

            document.querySelector(DOMstring.labelBudget).textContent =formatNumber(obj.budget,type);
            document.querySelector(DOMstring.labelIncome).textContent = formatNumber(obj.inc,'inc');
            document.querySelector(DOMstring.labelExpense).textContent = formatNumber(obj.exp,'exp');
            if  (obj.percentage>0){
            document.querySelector(DOMstring.labelPercentage).textContent = obj.percentage + '%';
            }   else{
            document.querySelector(DOMstring.labelPercentage).textContent = '---';
            }
        },
        displayDate: function(){

            var now,month,year;

            now= new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstring.labelDate).textContent= month+', '+year;
        },
        changedtype: function(){
            var field= document.querySelectorAll(DOMstring.type + ','
                                                +DOMstring.des + ','
                                                +DOMstring.value);
            nodeListForEach(field,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstring.button).classList.toggle('red');
        }
    }

})();



var controller=(function (bdgtCtrl,UIctrl) {

    var setupInit = function () {
        var DOM = UIctrl.dom();
        document.querySelector(DOM.button).addEventListener('click',ctrlItems);
        document.addEventListener('keypress',function(e) {
        if(e.keyCode===13){
            ctrlItems();
        }        
    });
        //For Deleting Items
        document.querySelector(DOM.container).addEventListener('click', ctrlDel);
        document.querySelector(DOM.type).addEventListener('change',UIctrl.changedtype);
    }
    
    var updateBudget=function(){
        // 1. Calculate the Budget
        bdgtCtrl.calcBudg();
        // 2. Return the Budget
        var budget = bdgtCtrl.getBudget();
        // 3. Display the UI
        UIctrl.displayBudget(budget);
    }

    var updatePercentage= function () {
        // 1. Calculate Percentage
        budgetController.calcPercentage();
        // 2. Return Percentage
        var Per = budgetController.getPercentage();
        // 3. Display the UI
        UIctrl.displayPer(Per);
    }

    var ctrlItems = function () {
        var input, newItem;
        // 1. Get the Field Input Data
        input = UIctrl.getInput();
        
        if(input.des!=="" && !isNaN(input.value) && input.value>0){

        // 2. Add the new Item to Budget Controller
        newItem = budgetController.addItem(input.type,input.des,input.value);

        // 3. Add Item to UI
        UIctrl.addItemUI(newItem,input.type); 

        // 4. Clear UI Fields
        UIctrl.clearField();

        // 5. Calculate & Update the Budget
        updateBudget();
        updatePercentage();
    }
    }

    var ctrlDel = function(e){
        var Items,splitID,type,ID;
        Items = e.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (Items){
            splitID = Items.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the Item from Data Structure
            budgetController.deleteItem(type,ID);
            // 2. Delete the Item from UI
            UIctrl.delItems(Items);
            // 3. Update & Show the new Budget
            updateBudget();
        }
    }

    return{
        init : function () {
            console.log('Application Has Started');
            UIctrl.displayDate();
            UIctrl.displayBudget({
                budget : 0,
                percentage: 0,
                inc: 0,
                exp: 0
            });
            setupInit();
        }
        
    }
    
    
})(budgetController,UIcontroller);


controller.init();