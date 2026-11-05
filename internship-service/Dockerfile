FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY . .
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
RUN cp build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]