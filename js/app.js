"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/

var commentForm = document.getElementById("comment-form");

function validateForm(form) {
    var requiredFields = ['firstName', 'lastName', 'title'];
    var formValid = true;

    for (var idx = 0; idx < requiredFields.length; ++idx) {
        var field = requiredFields[idx];
        formValid &= validateRequiredField(form.elements[field]);
    }
    return formValid;
}

function validateRequiredField(field) {
    var value = field.value.trim();
    var valid = value.length > 0;

    if (valid) {
        field.className = 'form-control';
    }
    else {
        field.className = 'form-control invalid-field'
    }
    return valid;
}

angular.module('ProductPage', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'FINnsz83hXki5mrULzzAVFitJmVErfHgXRcJnjsQ';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'hgeIRWExswSNOaiqAe8RilazhWvu3aJbfcM3z0AM';
    })
    .controller('CommentsController', function($scope, $http) {
        var commentsUrl = 'https://api.parse.com/1/classes/comments';

        $scope.refreshComments = function() {
            $scope.loading = true;
            $http.get(commentsUrl + '?order=-votes')
                .success(function(responseData) {
                    $scope.comments = responseData.results;
                    if (responseData.results.length == 0) {
                        $scope.isEmpty = true;
                    }
                    else {
                        $scope.isEmpty = false;
                    }
                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.loading = false;
                })
        };

        $scope.refreshComments();

        $scope.newComments = {
            title: '',
            firstName: '',
            lastName: '',
            body: '',
            votes: 0,
            ratings: null
        };

        $scope.addComments = function() {

            var firstName = $scope.newComments.firstName.trim();
            var lastName = $scope.newComments.lastName.trim();
            var title = $scope.newComments.title.trim();

            if (firstName.length == 0) {
                var fNameField = document.getElementById('firstName');
                fNameField.className('form-control invalid-field')
            }

            if (lastName.length == 0) {
                var lNameField = document.getElementById('lastName');
                lNameField.className('form-control invalid-field');
            }

            if (title.length == 0)

            $scope.inserting = true;

            $http.post(commentsUrl, $scope.newComments)
                .success(function(responseData) {
                    $scope.newComments.objectId = responseData.objectId;

                    $scope.comments.push($scope.newComments);

                    $scope.isEmpty = false;

                    $scope.newComments = {ratings: null, votes: 0};

                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.inserting = false;
                })
        }; //addComment()

        $scope.incrementVotes = function(comment, amount) {
            $scope.updating = true;

            $scope.votes = {
                votes: {
                    __op: 'Increment',
                    amount: amount
                }
            };

            if ($scope.votes.votes.amount == -1) {
                if (comment.votes < 1 || comment.votes == null) {
                    return;
                }
            }

            $http.put(commentsUrl + '/' + comment.objectId, $scope.votes)
                .success(function(responseData) {
                    comment.votes = responseData.votes;
                })
                .error(function(err) {
                    console.log(err);
                })
                .finally(function() {
                    $scope.updating = false;
                });
        }; //incrementScore()

        $scope.deleteComment = function(comment) {
            $http.delete(commentsUrl + '/' + comment.objectId)
                .success(function () {
                    $scope.refreshComments();
                })
                .error(function (err) {
                    console.log(err);
                })

        }; //deleteComment()

    });
