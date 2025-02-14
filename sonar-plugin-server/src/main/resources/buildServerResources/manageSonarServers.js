/*
 * Copyright 2000-2022 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by linfar on 6/3/14.
 */

SonarPlugin = {
    initPage: function () {
        var $pf = $j(".runnerFormTable input[id='sonar.password_field']");
        $pf.click(function () {
            $pf.val("");
            $pf.attr("data-modified", "modified");
        }).keydown(function () {
            $pf.attr("data-modified", "modified");
        });
        var $tf = $j(".runnerFormTable input[id='sonar.token_field']");
        $tf.click(function () {
            $tf.val("");
            $tf.attr("data-modified", "modified");
        }).keydown(function () {
            $tf.attr("data-modified", "modified");
        });
        var $pjf = $j(".runnerFormTable input[id='sonar.jdbc.password_field']");
        $pjf.click(function () {
            $pjf.val("");
            $pjf.attr("data-modified", "modified");
        }).keydown(function () {
            $pf.attr("data-modified", "modified");
        });
        $j(".enableDatabaseSettings").click(function () {
            $j(".databaseSettings").show();
            $j(".enableDatabaseSettings").hide();
        });
        $j('input[name="sonar.useTokenLogin"]').click(function () {
            let tokenSelected = $j('input[id="sonar.useTokenLogin.true"]').prop("checked");
            if (tokenSelected) {
                $j(".tokenAuthBlock").show();
                $j(".loginAuthBlock").hide();
            } else {
                $j(".tokenAuthBlock").hide();
                $j(".loginAuthBlock").show();
            }
        });
    },
    encryptPassword: function(pass) {
        return BS.Encrypt.encryptData(pass, $j('#publicKey').val());
    },
    removeServer: function(projectId, serverId) {
        if (!confirm("The profile will be permanently deleted. Proceed?")) {
            return;
        }
        BS.ajaxRequest(window['base_uri'] + '/admin/manageSonarServers.html', {
            parameters: Object.toQueryString({
                action: 'removeSqs',
                projectId: projectId,
                'serverinfo.id': serverId
            }),
            onComplete: function(transport) {
                $("SQservers").refresh();
            }
        });
    },
    editServer: function(data) {
        SonarPlugin.ServerConnectionDialog.showDialog('editSqs', data);
        $j(".runnerFormTable input[id='serverinfo.id']").prop("disabled", true);
    },
    addServer: function(projectId) {
        SonarPlugin.ServerConnectionDialog.showDialog('addSqs', {id: '', name: '', url: '', tokenLoginUsed: 'true', token: '', login: '', password: '', JDBCUsername: '', JDBCPassword: '', projectId: projectId});
        $j(".runnerFormTable input[id='sonar.password_field']").attr("data-modified",  "modified");
        $j(".runnerFormTable input[id='sonar.token_field']").attr("data-modified",  "modified");
        $j(".runnerFormTable input[id='sonar.jdbc.password_field']").attr("data-modified",  "modified");
    },
    ServerConnectionDialog: OO.extend(BS.AbstractWebForm, OO.extend(BS.AbstractModalDialog, {
        getContainer: function () {
            return $('serverInfoDialog');
        },

        formElement: function () {
            return $('serverInfoForm');
        },

        showDialog: function (action, data) {
            $j("input[id='SQSaction']").val(action);
            this.cleanFields(data);
            this.cleanErrors();
            this.showCentered();
        },

        cleanFields: function (data) {
            $j("input[id='serverinfo.id']").val(data.id);
            $j(".runnerFormTable input[id='serverinfo.name']").val(data.name);
            $j(".runnerFormTable input[id='sonar.host.url']").val(data.url);
            if (data.tokenLoginUsed === "true") {
                $j('input[id="sonar.useTokenLogin.true"]').prop("checked", "checked");
                $j(".tokenAuthBlock").show();
                $j(".loginAuthBlock").hide();
                $j(".runnerFormTable input[id='sonar.login']").val("");
                $j(".runnerFormTable input[id='sonar.password']").val("").removeAttr("data-modified");
            } else {
                $j('input[id="sonar.useTokenLogin.false"]').prop("checked", "checked");
                $j(".tokenAuthBlock").hide();
                $j(".loginAuthBlock").show();
                $j(".runnerFormTable input[id='sonar.login']").val(data.login);
                $j(".runnerFormTable input[id='sonar.password']").val(data.password).removeAttr("data-modified");
            }
            $j(".runnerFormTable input[id='sonar.token_field']").val(data.token ? "*****" : "").removeAttr("data-modified");
            $j(".runnerFormTable input[id='sonar.password_field']").val(data.password ? "*****" : "").removeAttr("data-modified");
            $j(".runnerFormTable input[id='sonar.jdbc.url']").val(data.JDBCUrl);
            $j(".runnerFormTable input[id='sonar.jdbc.username']").val(data.JDBCUsername);
            $j(".runnerFormTable input[id='sonar.jdbc.password']").val(data.JDBCPassword);
            $j(".runnerFormTable input[id='sonar.jdbc.password_field']").val(data.JDBCPassword ? "*****" : "" );
            if (data.JDBCUrl || data.JDBCUsername || data.JDBCPassword) {
                $j(".runnerFormTable .databaseSettings").show();
                $j(".enableDatabaseSettings").hide();
            } else {
                $j(".runnerFormTable .databaseSettings").hide();
                $j(".enableDatabaseSettings").show();
            }
            $j("#serverInfoForm input[id='projectId']").val(data.projectId);

            this.cleanErrors();
        },

        cleanErrors: function () {
            $j("#serverInfoForm .error").remove();
        },

        error: function($element, message) {
            var next = $element.next();
            if (next != null && next.prop("class") != null && next.prop("class").indexOf('error') > 0) {
                next.text(message);
            } else {
                $element.after("<p class='error'>" + message + "</p>");
            }
        },

        doValidate: function() {
            var errorFound = false;

            var url = $j('input[id="sonar.host.url"]');
            if (url.val() == "") {
                this.error(url, "Please set the server URL");
                errorFound = true;
            }

            var name = $j('input[id="serverinfo.name"]');
            if (name.val() == "") {
                this.error(name, "Please set the server name");
                errorFound = true;
            }

            if ($j(".runnerFormTable input[name='sonar.useTokenLogin']:checked").val() === "true") {
                var token = $j('input[id="sonar.token_field"]');
                if (token.val() == "") {
                    this.error(token, "Please set the token value or use login access");
                    errorFound = true;
                }
            }


            return !errorFound;
        },

        doPost: function() {
            this.cleanErrors();

            if (!this.doValidate()) {
                return false;
            }

            var parameters = {
                "serverinfo.name": $j(".runnerFormTable input[id='serverinfo.name']").val(),
                "sonar.host.url" : $j(".runnerFormTable input[id='sonar.host.url']").val(),
                "sonar.useTokenLogin": $j(".runnerFormTable input[name='sonar.useTokenLogin']:checked").val(),
                "sonar.login": $j(".runnerFormTable input[id='sonar.login']").val(),
                "sonar.jdbc.url": $j(".runnerFormTable input[id='sonar.jdbc.url']").val(),
                "sonar.jdbc.username": $j(".runnerFormTable input[id='sonar.jdbc.username']").val(),
                "projectId": $j("#serverInfoForm #projectId").val(),
                action: $j("#serverInfoForm #SQSaction").val(),
                "serverinfo.id": $j("#serverInfoForm input[id='serverinfo.id']").val(),
                "publicKey" : $j("#serverInfoForm #publicKey").val()
            };

            var $jdbcPasswordField = $j(".runnerFormTable input[id='sonar.jdbc.password_field']");
            if ($jdbcPasswordField.attr("data-modified") == "modified") {
                parameters["sonar.jdbc.password"] = SonarPlugin.encryptPassword($jdbcPasswordField.val());
            } else {
                parameters["sonar.jdbc.password_preserve"] = "true";
            }

            var $passwordField = $j(".runnerFormTable input[id='sonar.password_field']");
            if ($passwordField.attr("data-modified") == "modified") {
                parameters["sonar.password"] = SonarPlugin.encryptPassword($passwordField.val());
            } else {
                parameters["sonar.password_preserve"] = "true";
            }

            var $tokenField = $j(".runnerFormTable input[id='sonar.token_field']");
            if ($tokenField.attr("data-modified") == "modified") {
                parameters["sonar.token"] = SonarPlugin.encryptPassword($tokenField.val());
            } else {
                parameters["sonar.token_preserve"] = "true";
            }

            var dialog = this;

            BS.ajaxRequest(window['base_uri'] + '/admin/manageSonarServers.html', {
                parameters: parameters,
                onComplete: function(transport) {
                    var shouldClose = true;
                    if (transport != null && transport.responseXML != null) {
                        var response = transport.responseXML.getElementsByTagName("response");
                        if (response != null && response.length > 0) {
                            var responseTag = response[0];
                            var error = responseTag.getAttribute("error");
                            if (error != null) {
                                shouldClose = false;
                                alert(error);
                            }
                            if (responseTag.getAttribute("status") == "OK") {
                                shouldClose = true;
                            } else if (responseTag.firstChild == null) {
                                shouldClose = false;
                                alert("Error: empty response");
                            }
                        }
                    }
                    if (shouldClose) {
                        $("SQservers").refresh();
                        dialog.close();
                    }
                }
            });

            return false;
        }
    }))
};
