package com.x1ct34m.nctf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;


@SpringBootApplication
public class ExternalTomcatStarter extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(ExternalTomcatStarter.class, args);
    }

    /**
     *提供外部tomcat启动入口
     */
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        // 注意这里要指向原先用main方法执行的Application启动类
        return builder.sources(Application.class);
    }


    // -- Mvc configuration ---------------------------------------------------
//外部Tomcat下会报错，尚未解决
//    @Bean
//    WebMvcConfigurer createWebMvcConfigurer(@Autowired HandlerInterceptor[] interceptors) {
//        return new WebMvcConfigurer() {
//            @Override
//            public void addResourceHandlers(ResourceHandlerRegistry registry) {
//                registry.addResourceHandler("/oasystem/static/**").addResourceLocations("classpath:/static/");
//            }
//        };
//    }
}