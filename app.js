
var budgetController=(function(){
	var income=function(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
	};
	var expense=function(id,des,val){
		this.id=id;
		this.des=des;
		this.val=val;
		this.percentage=-1;
	};
	expense.prototype.calcpercentage=function (totalincome) {
		if (totalincome > 0){
			this.percentage=Math.round((this.val/totalincome)*100);
		}else {
			this.percentage=-1;
		}
	};
	expense.prototype.getpercentage=function () {
		return this.percentage
	};
	var calc=function(type){
		var sum=0;
		var i=0;
		while(i<data.allitems[type].length){
			sum+=data.allitems[type][i].val;
			i++;
		}
		if(data.allitems[type].length === 0)
			data.individualperc=0;

		else
			data.individualperc = Math.round((data.allitems[type][data.allitems[type].length - 1].val / data.total.inc) * 100);
		data.total[type] = sum;


	};
	var data={
		allitems:	{
			exp: [],
			inc: []
		},
		total:{
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1,
		individualperc: -1
		
	};
	var calculatebudget=function(type){
			calc(type);
			if(data.total.inc>0){
			data.budget=data.total['inc']-data.total['exp'];
			data.percentage=Math.round((data.total.exp/data.total.inc)*100);
				
			}
			else{
				data.budget=data.total['inc']-data.total['exp'];
			}
		};
		
	return{
		getinput: function(type,des,val){
			var obj,ID;
			if(data.allitems[type].length>0){
				ID = (data.allitems[type][data.allitems[type].length-1]).id + 1;
			}else{
				ID=0;
			}
			if(type==="exp"){
				obj=new expense(ID,des,val);
				data.total[type]+=val;
				data.allitems[type].push(obj);
				data.objectID=ID;
				calculatebudget(type);
			}else{
				obj=new income(ID,des,val);
				data.total[type]+=val;
				data.allitems[type].push(obj);
				data.objectID=ID;
				calculatebudget(type);
			}
			return obj;
		},
		
		deleteitem: function(type,id){
           var ids, index;
           ids=data.allitems[type].map(function(current){    //map returns array
               return current.id;
           });
           index=ids.indexOf(id); //-1 if the element wasn't found on the array
           if(index !== -1){
                 data.allitems[type].splice(index,1);
                 calculatebudget(type);
           }
		},
		
		log: function(){
			              console.log(data);
			
		},
		getbudget: function(){
			return {
				budget: data.budget,
				totalinc: data.total.inc,
				totalexp: data.total.exp,
				percentage: data.percentage,
				individualpercentage: data.individualperc
			}
		},
		calucalatepercentages: function () {
			data.allitems.exp.forEach(function (cur) {
				cur.calcpercentage(data.total.inc);
			});
		},
		getpercentages: function () {
			var allperc=data.allitems.exp.map(function (cur) {
				return cur.getpercentage();
			});
			return allperc;
		}
		
	}
	
})();
var UIcontrol=(function(){
	
	var DOMstring={
		incomecontainer: ".income__list",
		expensecontainer: ".expenses__list",
		budgetval: ".budget__value",
		incomelabel: ".budget__income--value",
		expenselabel: ".budget__expenses--value",
		percentagelabelexp: ".budget__expenses--percentage",
		percentagelabelinc:".budget__income--percentage",
		contain: ".container",
		expensesperclabel: ".item__percentage",
		datelabel: ".budget__title--month",
		inputlabel: ".add__type",
		inputdescription: ".add__description",
		inputvalue: ".add__value",
		inputbtn: ".ion-ios-checkmark-outline"
	};

	  var formatNumber= function(num,type){
		num=Math.abs(num);
		num=num.toFixed(2);
		var numsplit=num.split('.');
		var int=numsplit[0];
		var dec=numsplit[1];
		if(int.length > 3){
			int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
		}

		return ((type === "exp")?'-':'+')+' '+int+'.'+dec;
	};
	
	return{
		getinput: function(){
			return{
				type: document.querySelector(".add__type").value,
				description: document.querySelector(".add__description").value,
				value: parseFloat(document.querySelector(".add__value").value)
			};
		},
		addlist: function(obj,type){
			var html,element,newhtml;
			if(type==="inc"){
				element=DOMstring.incomecontainer;
			html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else{
				element=DOMstring.expensecontainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			newhtml=html.replace("%id%",obj.id);
			newhtml=newhtml.replace("%description%",obj.des);
			newhtml=newhtml.replace("%value%",formatNumber(obj.val,type));
			document.querySelector(element).insertAdjacentHTML("beforeend",newhtml);
		},
		deletelistitem: function(selectorID){
			//bit strange because you ll first have to go to parent and then select child as js
			//can only delete a child element
			var element=document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		clearfields: function(){
			var fields=document.querySelectorAll(".add__description"+", "+".add__value");
			var fieldsarray=Array.prototype.slice.call(fields);
			fieldsarray.forEach(function(cur,i,arr){
				cur.value="";
			});
		fieldsarray[0].focus();
		},
		update_budget: function(obj){
			var type;
			(obj.budget>0)?type="inc":type="exp";
			document.querySelector(DOMstring.budgetval).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMstring.incomelabel).textContent=formatNumber(obj.totalinc,"inc");
			document.querySelector(DOMstring.expenselabel).textContent=formatNumber(obj.totalexp,"exp");
			document.querySelector(DOMstring.percentagelabelexp).textContent=obj.percentage;
			document.querySelector(DOMstring.budgetval).innerHTML=formatNumber(obj.budget,type);
		},
		displaypercentages: function(percentages){
			var fields=document.querySelectorAll(DOMstring.expensesperclabel);
			var nodeListForEach=function (list,callback) {
				for(var i=0;i<list.length;i++){
					callback(list[i],i);
				}
			};
			nodeListForEach(fields,function (current,index) {
				if (percentages[index] > 0){
					current.textContent=percentages[index]+"%";
				}else {
					current.textContent="---";
				}
			});
		},
		displaymonth: function(){
			var now,year;
			now = new Date();
			year=now.getFullYear();
			var month=now.getMonth();
			document.querySelector(DOMstring.datelabel).textContent=month+' '+year;
		},
		changedtype: function(){
			var fields=document.querySelectorAll(DOMstring.inputlabel+','+
			DOMstring.inputdescription+','+DOMstring.inputvalue);
			var nodeListForEach=function (list,callback) {
				for(var i=0;i<list.length;i++){
					callback(list[i]);
				}
			};
			 nodeListForEach(fields,function(current) {
				current.classList.toggle("red-focus");
			});
			document.querySelector(DOMstring.inputbtn).classList.toggle("red");
		},

		getDOMstrings: function(){
			return DOMstring;
		}
		
}})();

var globalcontroller=(function(budgetController,UIcontrol){
	
	var domstring=UIcontrol.getDOMstrings();
	
	var updatebudget=function(){
		var budget=budgetController.getbudget();
		UIcontrol.update_budget(budget);
	};
	var updatepercentages=function () {
		budgetController.calucalatepercentages();
		var percentages=budgetController.getpercentages();
		UIcontrol.displaypercentages(percentages);
	};
	var ctrladditem=function(){
		var inputfieldobject=UIcontrol.getinput();
		if(inputfieldobject.description!=="" && !isNaN(inputfieldobject.value) && inputfieldobject.value>0){
			var inputobj=budgetController.getinput(inputfieldobject.type,inputfieldobject.description,inputfieldobject.value);
		
		UIcontrol.addlist(inputobj,inputfieldobject.type);
		
		UIcontrol.clearfields();
			updatebudget(inputobj);
			updatepercentages();
		}
		return;
	};
	function ctrldelitem(event){
		var itemid,splitid,splittype,ID;
		itemid=event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemid);
		if(itemid){
			splitid=itemid.split('-');
			splittype=splitid[0];
			ID=parseInt(splitid[1]);
            budgetController.deleteitem(splittype,ID);
            UIcontrol.deletelistitem(itemid);
            var object_updater=budgetController.getbudget();
            UIcontrol.update_budget(object_updater);
            updatepercentages();
		}
	};
	function eventadder(){
		document.querySelector(".add__btn").addEventListener("click",ctrladditem);
	document.addEventListener("keypress",function(event){
		if(event.keyCode===13||event.which===13){
			ctrladditem();
		}
		document.querySelector(domstring.contain).addEventListener("click",ctrldelitem);
		document.querySelector(domstring.inputlabel).addEventListener('change',UIcontrol.changedtype);
	});
	}
	return{
		init: function(){
			console.log("THE APP HAS STARTED");
			UIcontrol.displaymonth();
			UIcontrol.update_budget({
				budget: 0,
				totalinc: 0,
				totalexp: 0,
				percentage: 0
			});
			eventadder();
		}
	};
	
})(budgetController,UIcontrol);
globalcontroller.init();