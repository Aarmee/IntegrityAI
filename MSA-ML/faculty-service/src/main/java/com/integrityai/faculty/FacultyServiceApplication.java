package com.integrityai.faculty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FacultyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FacultyServiceApplication.class, args);
	}

}
