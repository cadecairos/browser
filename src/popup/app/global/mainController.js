angular
    .module('bit.global')

    .controller('mainController', function ($scope, $transitions, $state, authService, toastr, i18nService, $analytics, utilsService,
        $window) {
        var self = this;
        self.animation = '';
        self.xsBody = $window.screen.availHeight < 600;
        self.smBody = !self.xsBody && $window.screen.availHeight <= 800;

        $transitions.onSuccess({}, function(transition) {
            const toParams = transition.params("to");

            if (toParams.animation) {
                self.animation = toParams.animation;
                return;
            } else {
                self.animation = '';
            }
        });

        chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
            if (msg.command === 'syncCompleted') {
                $scope.$broadcast('syncCompleted', msg.successfully);
            }
            else if (msg.command === 'syncStarted') {
                $scope.$broadcast('syncStarted');
            }
            else if (msg.command === 'doneLoggingOut') {
                authService.logOut(function () {
                    $analytics.eventTrack('Logged Out');
                    if (msg.expired) {
                        toastr.warning(i18nService.loginExpired, i18nService.loggedOut);
                    }
                    $state.go('home');
                });
            }
            else if (msg.command === 'collectPageDetailsResponse' && msg.sender === 'currentController') {
                $scope.$broadcast('collectPageDetailsResponse', {
                    frameId: sender.frameId,
                    tab: msg.tab,
                    details: msg.details
                });
            }
        });
    });
