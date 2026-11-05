FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY . .
RUN find . -name "gradlew" -exec sed -i 's/\x0D//g' {} +
RUN find . -name "gradlew" -exec chmod +x {} +
RUN ./gradlew bootJar -x test
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "build/libs/*.jar"]