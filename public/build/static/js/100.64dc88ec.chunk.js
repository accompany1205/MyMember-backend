(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[100],{1191:function(e,t){t.endianness=function(){return"LE"},t.hostname=function(){return"undefined"!==typeof location?location.hostname:""},t.loadavg=function(){return[]},t.uptime=function(){return 0},t.freemem=function(){return Number.MAX_VALUE},t.totalmem=function(){return Number.MAX_VALUE},t.cpus=function(){return[]},t.type=function(){return"Browser"},t.release=function(){return"undefined"!==typeof navigator?navigator.appVersion:""},t.networkInterfaces=t.getNetworkInterfaces=function(){return{}},t.arch=function(){return"javascript"},t.platform=function(){return"browser"},t.tmpdir=t.tmpDir=function(){return"/tmp"},t.EOL="\n",t.homedir=function(){return"/"}},2316:function(e,t,a){"use strict";a.r(t);var n=a(13),r=a(14),l=a(16),c=a(15),o=a(0),i=a.n(o),s=a(493),m=a(72),u=a(810),p=a(92),E=a(585),d=a(581),g=a(582),f=(a(4),a(45)),h=a(2),v=a(74),A=a(1375),b=a(1376),I=a(1378),y=a(820),w=a(816),S=a(818),k=a(580),B=a(1384),N=a(904),x=(a(99),a(21)),O=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(e){var r;return Object(n.a)(this,a),(r=t.call(this,e)).onsubmit=function(e){e.preventDefault(),r.props.createTestpaper(r.state)},r.state={fees_name:"",color:"",fees_description:"",programName:"",total_price:0},r.changeHandler=r.changeHandler.bind(Object(v.a)(r)),r}return Object(r.a)(a,[{key:"componentDidUpdate",value:function(e){this.props.shop.testpaperList.length>e.shop.testpaperList.length&&this.props.toggle()}},{key:"changeHandler",value:function(e){console.log(e.target.name,e.target.value),this.setState(Object(h.a)(Object(h.a)({},this.state),{},Object(f.a)({},e.target.name,e.target.value)))}},{key:"render",value:function(){var e;return i.a.createElement(A.a,null,i.a.createElement(b.a,null),i.a.createElement(I.a,null,i.a.createElement(y.a,{className:"mt-10",onSubmit:this.onsubmit},i.a.createElement(s.a,null,i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,null," Fee Name: ")),i.a.createElement(k.a,{type:"select",name:"fees_name",value:this.state.fees_name,onChange:this.changeHandler,id:"fees_name"},i.a.createElement("option",null,"Martial Arts Test"),i.a.createElement("option",null,"Candidate Test1"),i.a.createElement("option",null,"Candidate Test2"),i.a.createElement("option",null,"Candidate Test3")))),i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,null," Fees Description: ")),i.a.createElement(k.a,{type:"select",name:"fees_description",value:this.state.fees_description,onChange:this.changeHandler,id:"fees_description"},i.a.createElement("option",null,"Black Belt 2nd Dan Test Fee"),i.a.createElement("option",null,"Black Belt 3rd Dan Test Fee"),i.a.createElement("option",null,"Candidate Test22"),i.a.createElement("option",null,"Candidate Test33")))),i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,null,"Program: ")),i.a.createElement(k.a,{type:"select",name:"programName",value:this.state.programName,onChange:this.changeHandler,id:"programName"},i.a.createElement("option",null,"Program "),i.a.createElement("option",null,"svcvxcvxcv"),i.a.createElement("option",null,"Taekwondo"),i.a.createElement("option",null,"Kickboxing")))),i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,{for:"tpFloating"},"Total Price:")),i.a.createElement(B.a,(e={type:"number",name:"total_price",id:"total_price"},Object(f.a)(e,"name","total_price"),Object(f.a)(e,"value",this.state.total_price),Object(f.a)(e,"onChange",this.changeHandler),Object(f.a)(e,"placeholder","Total Price:"),e)))),i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement(s.a,null,i.a.createElement("div",{className:"col-md-3 col-sm-12 col-xs-12"},i.a.createElement(S.a,{for:"nameFloating"},"color")),i.a.createElement("div",{className:"col-md-9 col-sm-12 col-xs-12"},i.a.createElement(B.a,{type:"color",id:"colorFloating",className:"npt-1",name:"color",value:this.state.color,onChange:this.changeHandler}))))),i.a.createElement(m.a,{sm:"12"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement(p.a.Ripple,{color:"primary",type:"submit",className:"mr-1 mb-1"},"Save")))))))}}]),a}(i.a.Component),P=Object(x.b)((function(e){return{shop:e.shop}}),{createTestpaper:N.c})(O),F=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,l=new Array(r),c=0;c<r;c++)l[c]=arguments[c];return(e=t.call.apply(t,[this].concat(l))).state={activeTab:"1",modal:!1},e.toggleTab=function(t){e.state.activeTab!==t&&e.setState({activeTab:t})},e.toggleModal=function(){e.setState((function(e){return{modal:!e.modal}}))},e}return Object(r.a)(a,[{key:"render",value:function(){return i.a.createElement(i.a.Fragment,null,i.a.createElement(p.a.Ripple,{color:"success",onClick:this.toggleModal},"Add New"),i.a.createElement(E.a,{isOpen:this.state.modal,toggle:this.toggleModal,className:"modal-dialog-centered"},i.a.createElement(d.a,{toggle:this.toggleModal},"Create New Test Fee"),i.a.createElement(g.a,null,i.a.createElement(P,{toggle:this.toggleModal}))))}}]),a}(i.a.Component),C=a(846),j=a(819),J=a.n(j),T=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,l=new Array(r),c=0;c<r;c++)l[c]=arguments[c];return(e=t.call.apply(t,[this].concat(l))).state={steps:[{title:1,content:i.a.createElement(s.a,null,i.a.createElement(m.a,{md:"12",sm:"12"},i.a.createElement(y.a,null,i.a.createElement(s.a,null,i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,{for:"nameFloating"},"Program Image")),i.a.createElement("img",{src:J.a,width:"100px"}),i.a.createElement(B.a,{type:"file",name:"filename",id:"fileFloating",placeholder:"Program Name"}))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement(S.a,null," Student Type "),i.a.createElement(k.a,{type:"select",name:"select",id:"name"},i.a.createElement("option",null,"-- Select Student -- "),i.a.createElement("option",{value:"36093"},"fd fd"),i.a.createElement("option",{value:"36091"},"dds fds")))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement(S.a,{for:"EmailVertical"},"Membership Activation Date:")),i.a.createElement(B.a,{type:"date",name:"date",id:"dateVertical",placeholder:"Membership Activation Date"}))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement(S.a,{for:"registrationVertical"},"Registration Fee:")),i.a.createElement(B.a,{type:"number",name:"registration",id:"registrationVertical",placeholder:"$"}))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement(S.a,{for:"totalpriceVertical"},"  Total Price:")),i.a.createElement(B.a,{type:"number",name:"totalprice",id:"totalpriceVertical",placeholder:"$"}))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement(S.a,{for:"totalpriceVertical"}," Balance:")),i.a.createElement(B.a,{type:"number",name:"balance",id:"balanceVertical",placeholder:"$"}))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement(S.a,{for:"totalpriceVertical"},"Down Payment:")),i.a.createElement(B.a,{type:"number",name:"downPayment",id:"downPaymentVertical",placeholder:"$"}))),i.a.createElement(m.a,{sm:"8 cl-h"},i.a.createElement(w.a,null,i.a.createElement(s.a,null,i.a.createElement("div",{className:"col-md-3"},i.a.createElement(B.a,{type:"radio",name:"Cash",id:"CashVertical"}),i.a.createElement(S.a,{for:"CashpriceVertical"},"Cash")),i.a.createElement("div",{className:"col-md-3"},i.a.createElement(B.a,{type:"radio",name:"Check",id:"CheckVertical"}),i.a.createElement(S.a,{for:"CheckpriceVertical"},"Check")),i.a.createElement("div",{className:"col-md-3"},i.a.createElement(B.a,{type:"radio",name:"Credit",id:"CreditVertical"}),i.a.createElement(S.a,{for:"CreditVertical"}," Credit Card"))))),i.a.createElement(m.a,{sm:"3"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,{for:"PaymentsFloating"},"Payments")),i.a.createElement(B.a,{type:"text",name:"Payments",id:"paymentsFloating",placeholder:"Payments"}))),i.a.createElement(m.a,{sm:"3"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,null," Monthly ")),i.a.createElement(k.a,{type:"select",name:"select",id:"profiletype"},i.a.createElement("option",null,"Monthly"),i.a.createElement("option",null,"Weekly"),i.a.createElement("option",null,"PIF")))),i.a.createElement(m.a,{sm:"3"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,{for:"dollerFloating"},"Of $")),i.a.createElement(B.a,{type:"text",name:"doller",id:"dollerFloating",placeholder:"$"}))),i.a.createElement(m.a,{sm:"3"},i.a.createElement(w.a,{className:"form-label-group"},i.a.createElement("div",null,i.a.createElement(S.a,null," Due Every ")),i.a.createElement(k.a,{type:"select",name:"select",id:"Due"},i.a.createElement("option",null,"1st"),i.a.createElement("option",null,"5"),i.a.createElement("option",null,"10"),i.a.createElement("option",null,"15"),i.a.createElement("option",null,"20"),i.a.createElement("option",null,"25"),i.a.createElement("option",null,"30")))),i.a.createElement(m.a,{sm:"8 cl-h"},i.a.createElement(w.a,null,i.a.createElement("div",null,i.a.createElement("label",null,"Next Payment Due:")),i.a.createElement(s.a,null,i.a.createElement("div",{className:"col-md-6"},i.a.createElement(B.a,{type:"radio",name:"In-House",id:"In-House"}),i.a.createElement(S.a,{for:"In-HouseVertical"}," In-House")),i.a.createElement("div",{className:"col-md-6"},i.a.createElement(B.a,{type:"radio",name:"Auto-Pay",id:"Auto-PayVertical"}),i.a.createElement(S.a,{for:"Auto-PayVertical"}," Auto-Pay"))))),i.a.createElement(m.a,{sm:"4"},i.a.createElement(w.a,null,i.a.createElement(S.a,{for:""},"Pay Later"),i.a.createElement(k.a,{type:"select",name:"select",id:"status"},i.a.createElement("option",null,"Credit Card"),i.a.createElement("option",null,"Cash"),i.a.createElement("option",null,"Check"))))))))},{title:2,content:i.a.createElement(s.a,null,i.a.createElement(m.a,{md:"12",sm:"12"},i.a.createElement(y.a,null,i.a.createElement(s.a,null,i.a.createElement(m.a,{sm:"12"},i.a.createElement("p",null,i.a.createElement("strong",null,"Select a test date below and click next.")),i.a.createElement(w.a,null,i.a.createElement(S.a,{for:"EmailVertical"},"Select Student"),i.a.createElement(B.a,{type:"date",name:"Email",id:"EmailVertical"})))))))}]},e}return Object(r.a)(a,[{key:"render",value:function(){var e=this.state.steps;return i.a.createElement(A.a,null,i.a.createElement(I.a,null,i.a.createElement(C.a,{steps:e})))}}]),a}(i.a.Component),K=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,l=new Array(r),c=0;c<r;c++)l[c]=arguments[c];return(e=t.call.apply(t,[this].concat(l))).state={modal:!1},e.toggleModal=function(){e.setState((function(e){return{modal:!e.modal}}))},e}return Object(r.a)(a,[{key:"render",value:function(){return i.a.createElement(i.a.Fragment,null,i.a.createElement(p.a.Ripple,{color:"success",size:"sm",onClick:this.toggleModal},"Buy Now"),i.a.createElement(E.a,{isOpen:this.state.modal,toggle:this.toggleModal,className:"modal-dialog-centered modal-lg"},i.a.createElement(d.a,{toggle:this.toggleModal},"Buy Testing"),i.a.createElement(g.a,null,i.a.createElement(T,{toggle:this.toggleModal}))))}}]),a}(i.a.Component),H=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){return Object(n.a)(this,a),t.apply(this,arguments)}return Object(r.a)(a,[{key:"render",value:function(){return i.a.createElement(i.a.Fragment,null,i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("br",null),i.a.createElement("h6",null," Favorite Testing"),i.a.createElement("br",null))),i.a.createElement(s.a,null,i.a.createElement(m.a,{lg:"3",md:"12"},i.a.createElement(A.a,null,i.a.createElement(b.a,{style:{background:"#ff0000"}},i.a.createElement("h6",{style:{color:"#fff",textAlign:"center"}},"7 Months Beginner PIF(A)")),i.a.createElement(I.a,null,i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Duration:")),i.a.createElement(m.a,null,"7 months")),i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Price:")),i.a.createElement(m.a,null,"$800")),i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Payment Type:")),i.a.createElement(m.a,null,i.a.createElement("p",null,"PIF"))),i.a.createElement(s.a,null,i.a.createElement(m.a,null),i.a.createElement(m.a,null," ",i.a.createElement(K,null)," ")))))))}}]),a}(i.a.Component),L=a(324),V=a(448),Q=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){return Object(n.a)(this,a),t.apply(this,arguments)}return Object(r.a)(a,[{key:"componentDidMount",value:function(){this.props.getTests()}},{key:"render",value:function(){var e,t,a=this;return i.a.createElement(i.a.Fragment,null,i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("br",null),i.a.createElement("h6",null," All Test"),i.a.createElement("br",null))),i.a.createElement(s.a,null,(null===(e=this.props.shop)||void 0===e?void 0:e.testpaperList.length)>0&&(null===(t=this.props.shop)||void 0===t?void 0:t.testpaperList.reverse().map((function(e,t){return i.a.createElement(m.a,{lg:"3",md:"12",key:e._id},i.a.createElement(A.a,null,i.a.createElement(b.a,{style:{background:"".concat(e.color),padding:"5px 10px"}},i.a.createElement("h6",{style:{color:"#fff",margin:"0",fontWeight:"500",fontSize:"16px"}},e.fees_name),i.a.createElement("div",null,i.a.createElement(L.a,{size:"15",color:"#fff"}),i.a.createElement(V.a,{size:"15",color:"#fff",onClick:function(t){t.stopPropagation(),a.props.trashTestPaper(e._id),console.log("ljlkhj")}}))),i.a.createElement(I.a,{style:{padding:"10px"}},i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Program:")),i.a.createElement(m.a,null,e.programName)),i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Price:")),i.a.createElement(m.a,null,e.total_price)),i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement("p",null,"Fees Description:")),i.a.createElement(m.a,null,i.a.createElement("p",null,e.fees_description))),i.a.createElement(s.a,null,i.a.createElement(m.a,null),i.a.createElement(m.a,null," ",i.a.createElement(K,null)," ")))))})))))}}]),a}(i.a.Component),D=Object(x.b)((function(e){return{shop:e.shop}}),{getTests:N.i,trashTestPaper:N.k})(Q),z=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){return Object(n.a)(this,a),t.apply(this,arguments)}return Object(r.a)(a,[{key:"render",value:function(){return i.a.createElement(s.a,null,i.a.createElement(m.a,null,i.a.createElement(u.a,{breadCrumbTitle:"Store",breadCrumbParent:"Shop",breadCrumbActive:"Testing"}),i.a.createElement(F,null),i.a.createElement(H,null),i.a.createElement(D,null)))}}]),a}(i.a.Component);t.default=z},819:function(e,t){e.exports="data:image/png;base64,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"},846:function(e,t,a){"use strict";var n=a(13),r=a(14),l=a(16),c=a(15),o=a(0),i=a.n(o),s=a(4),m=a.n(s),u=a(820),p=a(1385),E=a(800),d=a(801),g=a(1386),f=a(1388),h=a(92),v=a(929),A=function(e){Object(l.a)(a,e);var t=Object(c.a)(a);function a(){var e;Object(n.a)(this,a);for(var r=arguments.length,l=new Array(r),c=0;c<r;c++)l[c]=arguments[c];return(e=t.call.apply(t,[this].concat(l))).state={activeStep:e.props.activeStep?e.props.activeStep:0,errors:[],values:[]},e.handleNextStep=function(t,a){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],r=e.state.activeStep,l=e.props.validate;if(l)if(0===n.length&&r<=t&&r!==a)e.setState({activeStep:r+1});else{if(!n.length||!e.props.onValidationError)return;e.props.onValidationError(e.state.errors)}else r<=t&&r!==a&&e.setState({activeStep:r+1})},e.handlePreviousStep=function(t){var a=e.state.activeStep;a>=t&&e.setState({activeStep:a-1})},e.handleEnableAllSteps=function(t){e.props.enableAllSteps&&e.setState({activeStep:t})},e.handleSubmit=function(t){e.props.steps.length-1===e.state.activeStep&&e.props.onFinish&&e.props.onFinish(t)},e}return Object(r.a)(a,[{key:"render",value:function(){var e=this,t=this.props.validate?v.AvForm:u.a;return i.a.createElement(i.a.Fragment,null,i.a.createElement(p.a,{className:"vx-wizard ".concat(this.props.className?this.props.className:""),tabs:!0},this.props.steps.map((function(t,a){return i.a.createElement(E.a,{className:"step-wrapper",key:a,onClick:function(){return e.handleEnableAllSteps(a)}},i.a.createElement(d.a,{className:m()("step step-".concat(a),{active:e.state.activeStep===a,done:a<e.state.activeStep})},i.a.createElement("span",{className:"step-text"},t.title)))}))),i.a.createElement(g.a,{className:"vx-wizard-content ".concat(this.props.tabPaneClass?this.props.tabPaneClass:""),activeTab:this.state.activeStep},this.props.steps.map((function(a,n){return i.a.createElement(f.a,{className:"step-content step-".concat(n,"-content"),key:n,tabId:n},i.a.createElement(t,{className:"form-horizontal",onSubmit:function(t,a,r){e.setState({errors:a,values:r}),e.props.validate||t.preventDefault(),e.handleNextStep(n,e.props.steps.length-1,a),e.handleSubmit(t)}},a.content,e.props.pagination?i.a.createElement("div",{className:"wizard-actions d-flex justify-content-between"},i.a.createElement(h.a,{color:"primary",disabled:0===e.state.activeStep,onClick:function(){return e.handlePreviousStep(n)}},"Prev"),i.a.createElement(h.a,{type:"submit",color:"primary"},e.props.steps.length-1!==n||e.props.finishBtnText?e.props.steps.length-1===n&&e.props.finishBtnText?e.props.finishBtnText:"Next":"Submit")):null))}))))}}],[{key:"getDerivedStateFromProps",value:function(e,t){if(e.activeStep&&e.activeStep!==t.activeStep){if(!e.validate)return{activeStep:e.activeStep};if(0===t.errors.length&&t.submitted)return{activeStep:e.activeStep}}return null}}]),a}(i.a.Component);A.defaultProps={pagination:!0},t.a=A},904:function(e,t,a){"use strict";a.d(t,"e",(function(){return m})),a.d(t,"b",(function(){return u})),a.d(t,"d",(function(){return p})),a.d(t,"f",(function(){return E})),a.d(t,"j",(function(){return d})),a.d(t,"i",(function(){return g})),a.d(t,"c",(function(){return f})),a.d(t,"k",(function(){return h})),a.d(t,"h",(function(){return v})),a.d(t,"a",(function(){return A})),a.d(t,"g",(function(){return b}));var n=a(2),r=a(30),l=a.n(r),c=a(44),o=a(28),i=a.n(o),s=(a(1191),"http://34.135.114.71:8080"),m=function(){JSON.parse(localStorage.getItem("userdata"));return function(){var e=Object(c.a)(l.a.mark((function e(t){var a;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i.a.get("".concat(s,"/api/membership/membership_list/").concat(localStorage.getItem("user_id")),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(a=e.sent).data&&200===a.status&&t({type:"GET_MEMBERSHIP_LIST",payload:a.data}),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),console.log("something went wrong");case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}()},u=function(e){JSON.parse(localStorage.getItem("userdata"));var t=new FormData;return t=e,function(){var e=Object(c.a)(l.a.mark((function e(a){var n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i.a.post("".concat(s,"/api/membership/add_membership/").concat(localStorage.getItem("user_id")),t,{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token")),"content-type":"application/json"}});case 3:n=e.sent,console.log("response",n),n.data&&200===n.status&&a(m()),e.next=12;break;case 8:e.prev=8,e.t0=e.catch(0),console.log(e.t0),console.log("something went wrong");case 12:case"end":return e.stop()}}),e,null,[[0,8]])})));return function(t){return e.apply(this,arguments)}}()},p=function(e,t){var a=JSON.parse(localStorage.getItem("userdata"));new FormData;return e,function(){var n=Object(c.a)(l.a.mark((function n(r){var c;return l.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(n.prev=0,1!==a.data.role){n.next=7;break}return n.next=4,i.a.put("".concat(s,"/api/update_user_membership/").concat(a.data._id,"/").concat(t),e,{headers:{Authorization:"Bearer ".concat(a.token),"content-type":"application/json"}});case 4:c=n.sent,console.log(c),c.data&&200===c.status&&r(m());case 7:n.next=12;break;case 9:n.prev=9,n.t0=n.catch(0),console.log("something went wrong");case 12:case"end":return n.stop()}}),n,null,[[0,9]])})));return function(e){return n.apply(this,arguments)}}()},E=function(e){var t=e.membershipId;return function(){var e=Object(c.a)(l.a.mark((function e(a){var n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i.a.get("".concat(s,"/api/membership/info_membership/").concat(localStorage.getItem("user_id"),"/").concat(t),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(n=e.sent).data&&200===n.status&&console.log(n.data),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),console.log(e.t0);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}()},d=function(e){var t=JSON.parse(localStorage.getItem("userdata"));return function(a){1===t.data.role?i.a.delete("".concat(s,"/api/remove_user_membership/").concat(t.data._id,"/").concat(e),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}}).then((function(e){a(m())})):i.a.delete("".concat(s,"/api/membership/delete_membership/").concat(localStorage.getItem("user_id"),"/").concat(e),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}}).then((function(e){a(m())}))}},g=function(){return function(){var e=Object(c.a)(l.a.mark((function e(t){var a;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i.a.get("".concat(s,"/api/test/fees_list/").concat(localStorage.getItem("user_id")),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(a=e.sent).data&&200===a.status&&t({type:"GET_TESTPAPER_LIST",payload:a.data}),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),console.log("something went wrong");case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}()},f=function(e){return function(t){i.a.post("".concat(s,"/api/test_fees/").concat(localStorage.getItem("user_id")),Object(n.a)({},e),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}}).then((function(e){t(g())}))}},h=function(e){return console.log("coming here "),function(t){i.a.delete("".concat(s,"/api/test/feesdelete/").concat(localStorage.getItem("user_id"),"/").concat(e),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}}).then((function(e){t(g())}))}},v=function(){return function(){var e=Object(c.a)(l.a.mark((function e(t){var a;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i.a.get("".concat(s,"/api/member/active_student/").concat(localStorage.getItem("user_id")),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(a=e.sent).data&&200===a.status&&t({type:"GET_STUDENT_LIST",payload:a.data}),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),console.log("something went wrong");case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}()},A=function(e,t,a){var n="".concat(s,"/api/membership/buy_membership/").concat(localStorage.getItem("user_id"));return"student profile"==a?(delete e.student_name,n="".concat(s,"/api/membership/buy_membership/").concat(localStorage.getItem("user_id"),"/").concat(t)):delete e.membership_name,function(){var t=Object(c.a)(l.a.mark((function t(a){var r;return l.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,i.a.post(n,e,{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(r=t.sent).data&&200===r.status&&console.log(r.data),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),console.log(t.t0);case 10:case"end":return t.stop()}}),t,null,[[0,7]])})));return function(e){return t.apply(this,arguments)}}()},b=function(e){return function(){var t=Object(c.a)(l.a.mark((function t(a){var n;return l.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,i.a.get("".concat(s,"/api/member/member_info/").concat(localStorage.getItem("user_id"),"/").concat(e),{headers:{Authorization:"Bearer ".concat(localStorage.getItem("access_token"))}});case 3:(n=t.sent).data&&200===n.status&&a({type:"GET_STUDENT_PURCHASE_LIST",payload:n.data.membership_details}),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),console.log("something went wrong");case 10:case"end":return t.stop()}}),t,null,[[0,7]])})));return function(e){return t.apply(this,arguments)}}()}}}]);
//# sourceMappingURL=100.64dc88ec.chunk.js.map