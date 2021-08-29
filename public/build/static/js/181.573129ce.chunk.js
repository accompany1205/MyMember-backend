(this["webpackJsonpvuexy-react-admin-dashboard"]=this["webpackJsonpvuexy-react-admin-dashboard"]||[]).push([[181],{2248:function(e,a,t){"use strict";t.r(a);var l=t(13),r=t(14),n=t(16),i=t(15),d=t(0),s=t.n(d),c=t(493),o=t(72),m=t(1375),u=t(1376),g=t(92),f=t(1378),b=t(804),h=t(808),p=t(805),v=t(803),E=t(1384),w=t(810),N=t(179),S=t(840),C=t(21),y=t(813),z=t(845),A=t(355),k=t(223),D=t(400),F=t(407),x=t(320),R=t(286),L=t(22),O=(t(812),t(99),t(1026)),P=t(1023),_=t(1027),T=t(1028),G=t(1029),I=function(e){Object(n.a)(t,e);var a=Object(i.a)(t);function t(){var e;Object(l.a)(this,t);for(var r=arguments.length,n=new Array(r),i=0;i<r;i++)n[i]=arguments[i];return(e=a.call.apply(a,[this].concat(n))).state={rowData:null,pageSize:20,isVisible:!0,reload:!1,collapse:!0,status:"Opened",role:"All",selectStatus:"All",verified:"All",department:"All",defaultColDef:{sortable:!0,resizable:!0},searchVal:"",loading:!0,columnDefs:[{headerName:"",field:"",width:50,checkboxSelection:!0,headerCheckboxSelectionFilteredOnly:!0,headerCheckboxSelection:!0},{headerName:"Photo",field:"memberprofileImage",filter:!0,width:120,cellRendererFramework:function(e){return s.a.createElement("div",{className:"d-flex align-items-center cursor-pointer",onClick:function(){return L.a.push({pathname:"/student-info",state:{userId:e.data.userId,studentId:e.data._id,data:e.data}})}},s.a.createElement("img",{className:"rounded-circle mr-50",src:e.value,alt:"user avatar",height:"50",width:"50"}))}},{headerName:"First Name",field:"firstName",filter:!0,width:140,cellRendererFramework:function(e){return"".concat(e.value[0].toUpperCase()).concat(e.value.substr(1).toLowerCase())}},{headerName:"Last Name",field:"lastName",filter:!0,width:140,cellRendererFramework:function(e){return"".concat(e.value[0].toUpperCase()).concat(e.value.substr(1).toLowerCase())}},{headerName:"Status",field:"status",filter:!0,width:130,cellRendererFramework:function(e){return"active"===e.value.toLowerCase()?s.a.createElement("div",{className:"badge badge-pill badge-light-success"},"Active"):"expired"===e.value.toLowerCase()?s.a.createElement("div",{className:"badge badge-pill badge-light-danger"},"Expired"):"Freezed"===e.value.toLowerCase()?s.a.createElement("div",{className:"badge badge-pill badge-light-yellow"},"Frozen"):"overdue"===e.value.toLowerCase()?s.a.createElement("div",{className:"badge badge-pill badge-light-orange"},"Overdue"):"terminate"===e.value.toLowerCase()?s.a.createElement("div",{className:"badge badge-pill badge-light-danger"},"Terminate"):(e.value.toLowerCase(),s.a.createElement("div",{className:"badge badge-pill badge-light-grey"},"None"))}},{headerName:"Primary Phone",field:"primaryPhone",filter:!0,width:170},{headerName:"Program Category",field:"category",filter:!0,width:190,cellRendererFramework:function(e){return"program3"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-orange",style:{backgroundColor:"rgb(163, 5, 5)"}},"Pragrame3"):"program 4"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-danger",style:{textTransform:"none"}},"Program 4"):"Freezed"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-yellow"},"Frozen"):"overdue"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-orange"},"Overdue"):"terminate"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-danger"},"Terminate"):"inactive"===e.value?s.a.createElement("div",{className:"badge badge-pill badge-light-grey"},"None"):s.a.createElement("div",{className:"badge badge-pill badge-light-light"},s.a.createElement("div",{className:"badge badge-pill badge-light-grey"},"N/A"))}},{headerName:"Gender",field:"gender",filter:!0,width:150},{headerName:"Country",field:"country",filter:!0,width:200},{headerName:"Belt Size",field:"studentBeltSize",filter:!0,width:150},{headerName:"Manage",field:"transactions",width:150,cellRendererFramework:function(e){return s.a.createElement("div",{className:"actions cursor-pointer"},s.a.createElement(A.a,{className:"mr-50",size:18}),s.a.createElement(_.a,null),s.a.createElement(T.a,null),s.a.createElement(G.a,null))}}],getRowHeight:function(e){return 70}},e.onGridReady=function(a){e.gridApi=a.api,e.gridColumnApi=a.columnApi},e.filterData=function(a,t){var l=null;"all"!==t&&(l={type:"equals",filter:t}),e.gridApi.getFilterInstance(a).setModel(l),e.gridApi.onFilterChanged()},e.filterSize=function(a){e.gridApi&&(e.gridApi.paginationSetPageSize(Number(a)),e.setState({pageSize:a}))},e.updateSearchQuery=function(a){e.gridApi.setQuickFilter(a),e.setState({searchVal:a})},e.refreshCard=function(){e.setState({reload:!0}),setTimeout((function(){e.setState({reload:!1,role:"All",selectStatus:"All",verified:"All",department:"All"})}),500)},e.toggleCollapse=function(){e.setState((function(e){return{collapse:!e.collapse}}))},e.onEntered=function(){e.setState({status:"Opened"})},e.onEntering=function(){e.setState({status:"Opening..."})},e.onEntered=function(){e.setState({status:"Opened"})},e.onExiting=function(){e.setState({status:"Closing..."})},e.onExited=function(){e.setState({status:"Closed"})},e.removeCard=function(){e.setState({isVisible:!1})},e}return Object(r.a)(t,[{key:"componentDidMount",value:function(){this.props.GET_LEAD_LIST()}},{key:"componentDidUpdate",value:function(e){e.lead_student!==this.props.lead_student&&this.setState({rowData:this.props.lead_student,loading:!1})}},{key:"render",value:function(){var e=this,a=this.state,t=a.rowData,l=a.columnDefs,r=a.defaultColDef,n=a.pageSize;return s.a.createElement(c.a,{className:"app-user-list"},s.a.createElement(o.a,{sm:"12"},s.a.createElement(w.a,{breadCrumbTitle:"Lead Student",breadCrumbParent:"Home",breadCrumbActive:"Lead Student"}),s.a.createElement(m.a,null,s.a.createElement(u.a,null,s.a.createElement("div",{className:"list-icon"},s.a.createElement("a",{href:"/data-list/add-new-student"},s.a.createElement(g.a,{className:"btn-lg fides btn waves-effect waves-light",onClick:this.toggleModal},s.a.createElement(k.a,{size:21}),s.a.createElement("br",null),"Add")),s.a.createElement(g.a,{className:"btn-lg fides5 btn waves-effect waves-light"},s.a.createElement(D.a,{size:21}),s.a.createElement("br",null),"Contact"),s.a.createElement(O.a,null),s.a.createElement(P.a,null),s.a.createElement(g.a,{className:"btn-lg fides2 btn waves-effect waves-light"},s.a.createElement(F.a,{size:21}),s.a.createElement("br",null),"Print"),s.a.createElement(g.a,{className:"btn-lg fides1 btn waves-effect waves-light"},s.a.createElement(x.a,{size:21}),s.a.createElement("br",null),"Export"))),s.a.createElement(f.a,null,s.a.createElement("div",{className:"ag-theme-material ag-grid-table"},s.a.createElement("div",{className:"ag-grid-actions d-flex justify-content-between flex-wrap mb-1"},s.a.createElement("div",{className:"sort-dropdown"},s.a.createElement(b.a,{className:"ag-dropdown p-1"},s.a.createElement(h.a,{tag:"div"},"1 - ",n," of 150",s.a.createElement(R.a,{className:"ml-50",size:15})),s.a.createElement(p.a,{right:!0},s.a.createElement(v.a,{tag:"div",onClick:function(){return e.filterSize(20)}},"20"),s.a.createElement(v.a,{tag:"div",onClick:function(){return e.filterSize(50)}},"50"),s.a.createElement(v.a,{tag:"div",onClick:function(){return e.filterSize(100)}},"100"),s.a.createElement(v.a,{tag:"div",onClick:function(){return e.filterSize(150)}},"150")))),s.a.createElement("div",{className:"filter-actions d-flex"},s.a.createElement(E.a,{className:"w-70 mr-1 mb-1 mb-sm-0",type:"text",placeholder:"search...",onChange:function(a){return e.updateSearchQuery(a.target.value)},value:this.state.searchVal}))),this.state.loading?s.a.createElement("div",{id:"loading-bar"},s.a.createElement(z.a,{loading:!0})):s.a.createElement(s.a.Fragment,null,null!==this.state.rowData?s.a.createElement(N.a.Consumer,null,(function(a){return s.a.createElement(y.AgGridReact,{gridOptions:{},rowSelection:"multiple",defaultColDef:r,columnDefs:l,rowData:t,onGridReady:e.onGridReady,colResizeDefault:"shift",animateRows:!0,floatingFilter:!0,pagination:!0,pivotPanelShow:"always",paginationPageSize:n,resizable:!0,getRowHeight:e.state.getRowHeight,enableRtl:"rtl"===a.state.direction})})):null))))))}}]),t}(s.a.Component);a.default=Object(C.b)((function(e){return{lead_student:e.student.lead_student}}),{GET_LEAD_LIST:S.i})(I)}}]);
//# sourceMappingURL=181.573129ce.chunk.js.map