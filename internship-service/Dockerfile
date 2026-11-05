FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY . .
RUN sed -i 's/\x0D//g' gradlew
RUN chmod +x gradlew
RUN ./gradlew bootJar -x test
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "build/libs/*.jar"]