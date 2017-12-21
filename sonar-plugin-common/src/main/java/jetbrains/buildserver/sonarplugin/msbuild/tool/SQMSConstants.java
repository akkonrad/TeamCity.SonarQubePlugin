package jetbrains.buildserver.sonarplugin.msbuild.tool;

import org.jetbrains.annotations.NotNull;

public final class SQMSConstants {
    private SQMSConstants() {
    }

    @NotNull public static final String SONAR_QUBE_MSBUILD_TOOL_TYPE_ID = "sonar-qube-msbuild";
    @NotNull public static final String SONAR_QUBE_MSBUILD_VERSION_PARAMETER = "teamcity.tool.sonarqubemsbuild";

    @NotNull public static final String SONAR_QUBE_MSBUILD_RUN_TYPE_ID = "sonar-qube-msbuild";
}
