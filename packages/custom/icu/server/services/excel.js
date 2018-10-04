const XlsxPopulate = require('xlsx-populate');
const striptags = require('striptags');
/*
json structure:
{
  columnsBold:true\false
  columns:[col1,col2,col3],
  array of arrays=== rows:[row1,row2,row3]
  dates === rows:[row1,row2,row3]
  datesColumns:[dcol1,dcol2]
}
aoa = aray of arays = [row1,row2,row3,...] =example= [row1=[1,2,3],row2=[4,5,6],...]
*/

//same as json for json2workbook with additional datesColumns and aoa of dates
function json2workbookWithDates(json){
  return XlsxPopulate.fromBlankAsync()
  .then((workbook)=>{
    let regColumnsLength = json.columns.length;
    let datesColumnsLength = json.datesColumns.length;

    let sheet = workbook.sheet("Sheet1");

    for(let j = 0;j<regColumnsLength+datesColumnsLength;j++){
    if(j<regColumnsLength){
     sheet.row(1).cell(j+1).value(striptags(json.columns[j]))
     sheet.row(1).cell(j+1).style({
       "bold":json.columnsBold,
       "fontFamily":"Arial",
      });}
      else{
        sheet.row(1).cell(j+1).value(json.datesColumns[j-regColumnsLength]);
        sheet.row(1).cell(j+1).style({
          "bold":json.columnsBold,
          "fontFamily":"Arial",
         });
      }
    }

    for(let i = 0;i<json.rows.length;i++){
      for(let j =0;j<json.rows[i].length+json.dates[i].length;j++){
        let cell = sheet.row(i+2).cell(j+1);
        if(j<json.rows[i].length)
          cell.value(striptags(json.rows[i][j]));
        else {
          cell.value(json.dates[i][j-json.rows[i].length]);
          cell.style("numberFormat","dddd, mmmm dd, yyyy");
        }
        
        
        cell.style({
          "fontFamily":"Arial",
          "wrapText":true,
          "verticalAlignment":"top",
          "horizontalAlignment":"right",
          "textDirection":"left-to-right",
        });
    }}
    return workbook.outputAsync();
  })
  .catch((err)=>{
    console.log(err);
  });

}



/**
 *
 *Takes a json repesentation of excel and returs a workbook
 * @param {*} json A json that includes: columnsBold(bool) columns(array of string) rows(array of arrays of strings)
 */
function json2workbook(json){
  return XlsxPopulate.fromBlankAsync()
  .then((workbook)=>{

    let sheet = workbook.sheet("Sheet1");

    for(let j = 0;j<json.columns.length;j++){
     sheet.row(1).cell(j+1).value(striptags(json.columns[j]))
     sheet.row(1).cell(j+1).style({
       "bold":json.columnsBold,
       "fontFamily":"Arial",
      });
    }

    for(let i = 0;i<json.rows.length;i++){
      for(let j =0;j<json.rows[i].length;j++){
        let cell = sheet.row(i+2).cell(j+1);
        cell.value(striptags(json.rows[i][j]));
        cell.style({
          "fontFamily":"Arial",
          "wrapText":true,
          "verticalAlignment":"top",
          "horizontalAlignment":"right",
          "textDirection":"left-to-right",
        });
    }}
    return workbook.outputAsync();
  })
  .catch((err)=>{
    console.log(err);
  });
}


exports.json2workbook = json2workbook;
exports.json2workbookWithDates =json2workbookWithDates