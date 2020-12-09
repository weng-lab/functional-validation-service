FROM openjdk:8-jdk-alpine as build
COPY . /src
RUN ls -l /src/scripts/build.sh
RUN /src/scripts/build.sh

FROM openjdk:8-jre-alpine
COPY --from=build /src/build/functional-validation-importer-*.jar /app/functional-validation-importer.jar
