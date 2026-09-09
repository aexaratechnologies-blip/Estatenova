plugins {
    id("com.android.application")
}

android {
    namespace = "com.aexara.sellb2"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.aexara.sellb2"
        minSdk = 23
        targetSdk = 36
        versionCode = 3
        versionName = "1.2.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
