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
        versionCode = 7
        versionName = "1.3.3"
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("SELLB2_KEYSTORE")
            val storePassword = System.getenv("SELLB2_STORE_PASSWORD")
            val keyAlias = System.getenv("SELLB2_KEY_ALIAS")
            val keyPassword = System.getenv("SELLB2_KEY_PASSWORD")
            if (!keystorePath.isNullOrBlank() && !storePassword.isNullOrBlank()
                && !keyAlias.isNullOrBlank() && !keyPassword.isNullOrBlank()) {
                storeFile = file(keystorePath)
                this.storePassword = storePassword
                this.keyAlias = keyAlias
                this.keyPassword = keyPassword
            }
        }
    }

    buildTypes {
        release {
            isDebuggable = false
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
