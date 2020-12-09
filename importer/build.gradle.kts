import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
 
plugins {
    kotlin("jvm") version "1.3.11"
    id("com.github.johnrengelman.shadow") version "4.0.2"
    id("application")
}

group = "org.weng-lab.functional-validation-importer"
version = "0.0.0"
val artifactID = "functional-validation-importer"

repositories {
    jcenter()
}

dependencies {
    compile(kotlin("stdlib-jdk8"))
    compile(kotlin("reflect"))
    compile("org.apache.commons", "commons-compress", "1.20")
    implementation("com.squareup.okhttp3", "okhttp", "3.12.1")
    implementation("com.squareup.moshi", "moshi-kotlin", "1.8.0")
    implementation("com.squareup.moshi", "moshi-adapters", "1.8.0")
    compile("commons-net:commons-net:3.6")
    compile("org.postgresql", "postgresql", "42.2.2")
    compile("com.zaxxer", "HikariCP", "3.3.0")
    compile("com.github.ajalt", "clikt", "1.6.0")
    compile("io.github.microutils","kotlin-logging","1.6.10")
    compile("ch.qos.logback", "logback-classic","1.2.3")
    testImplementation("io.kotlintest", "kotlintest-runner-junit5", "3.1.11")
    testImplementation("com.squareup.okhttp3", "mockwebserver", "3.12.1")
}

val test by tasks.getting(Test::class) {
    useJUnitPlatform { }
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}
application {
    mainClassName = "AppKt"
}
val shadowJar: ShadowJar by tasks
shadowJar.apply {
    baseName = artifactID
    classifier = ""
    destinationDir = file("build")
}
