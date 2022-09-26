package com.x1ct34m.nctf.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Value("${management.access.iplist}")
    private String iplist;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //得到iplist列表
        String iprule = "";             //hasIpAddress('10.0.0.0/16') or hasIpAddress('127.0.0.1/32')
        String[] splitAddress=iplist.split(",");
        for(String ip : splitAddress){
            if (iprule.equals("")) {
                iprule = "hasIpAddress('"+ip+"')";
            } else {
                iprule += " or hasIpAddress('"+ip+"')";
            }
        }
        //String actuatorRule = "hasAnyRole('ADMIN','DEV') or ("+iprule+")";
        String actuatorRule = iprule;

        //匹配的页面，符合限制才可访问
        http.authorizeRequests()
                .antMatchers("/actuator/jolokia/**").access(actuatorRule);
        //剩下的页面，允许访问
        http.authorizeRequests().anyRequest().permitAll();
        //禁用CSRF token不然会403
        http.csrf().disable();
    }
}