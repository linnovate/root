function controllerExportExcelByDate($scope, $uibModalInstance, office, $filter,$http,ApiUri) {

    $scope.path = "" ;

    $scope.getPath = function () { 
        return $scope.path ;
    }

    
    $scope.office = office
    $scope.date ="";
    
    $scope.download = function(){
        let from = $scope.date.startDate && $scope.date.startDate.toISOString();
        let to = $scope.date.endDate && $scope.date.endDate.toISOString();
        let office = $scope.office._id;
        
        $http.post(ApiUri+"/officeDocuments/summary",{from,to,office},{
            responseType: 'arraybuffer',
        headers:{
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            
        }}).then(function(data){
            let blob = new Blob([data.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            saveAs(blob,'Summary.xlsx');
        });
        $uibModalInstance.dismiss('cancel');
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}