WORKDIR /app
COPY . .
# Yeh line add karein taaki gradlew ko execute permission mil jaye:
RUN chmod +x gradlew
RUN ./gradlew build -x test
EXPOSE 8080
CMD ["java", "-jar", "build/libs/*.jar"]