(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["report"],{"2fc5":function(e,r,t){"use strict";t.r(r);var o,i=function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("ihris-template",{key:e.$route.path},[e._v(" Loading... ")])},a=[],n=(t("d3b7"),t("a026")),h={name:"fhir-report",props:["report"],data:function(){return{}},created:function(){this.$route.params&&this.$route.params.report?o=this.$route.params.report:this.report&&(o=this.report),this.getTemplate()},methods:{getTemplate:function(){var e=this;fetch("/config/report/"+o).then((function(r){r.json().then((function(r){n["default"].component("ihris-template",{name:"ihris-template",data:function(){return{reportData:r.reportData,dataURL:r.dataURL,terms:{}}},components:{"ihris-report":function(){return Promise.all([t.e("fhir-main~fhir-primary~fhir-search~fhir-secondary~mhero"),t.e("fhir-primary~fhir-search~mhero"),t.e("fhir-search")]).then(t.bind(null,"2e2c"))},"ihris-search-term":function(){return Promise.all([t.e("fhir-main~fhir-primary~fhir-search~fhir-secondary~mhero"),t.e("fhir-primary~fhir-search~mhero"),t.e("fhir-search")]).then(t.bind(null,"d604"))}},template:r.reportTemplate,methods:{searchData:function(e,r){this.$set(this.terms,e,r)}}}),e.$forceUpdate(),console.log("updated template")})).catch((function(r){console.log(r),n["default"].component("ihris-template",{template:"<div><h1>Error</h1><p>An error occurred trying to load this report</p>.</div>"}),e.$forceUpdate()}))})).catch((function(r){console.log(r),n["default"].component("ihris-template",{template:"<div><h1>Error</h1><p>An error occurred trying to load this report</p>.</div>"}),e.$forceUpdate()}))}},components:{},beforeCreate:function(){n["default"].component("ihris-template",{template:"<div>Loading...</div>"})}},p=h,c=t("2877"),s=Object(c["a"])(p,i,a,!1,null,null,null);r["default"]=s.exports}}]);
//# sourceMappingURL=report.46926d42.js.map