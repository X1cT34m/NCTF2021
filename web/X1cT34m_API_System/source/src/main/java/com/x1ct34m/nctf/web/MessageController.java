package com.x1ct34m.nctf.web;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;

@RestController
public class MessageController {
    private String id;

    @PostMapping({"/user/list"})
    public String getUserlist(HttpServletRequest request) throws Exception {
        this.id = request.getParameter("id");
        if(request.getContentLength() == 0){
            return "<id></id><username></username>";
        }

        String requestString = safeXml(getRequestBody(request));
        if (request.getContentType().equals("application/xml")) {
            try {
                DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
                DocumentBuilder db = dbf.newDocumentBuilder();
                InputStream is = new ByteArrayInputStream(requestString.getBytes());
                Document doc = db.parse(is);
                if (doc.getDocumentElement().getTagName().equals("id") && doc.getDocumentElement().getChildNodes().item(0).getNodeName().equals("#text")) {
                    this.id = doc.getDocumentElement().getTextContent();
                } else {
                    throw new Exception();
                }
            } catch (Exception e) {
                return "<message>"+e+"</message>";
            }
        }else {
            return "<id></id><username></username>";
        }
        
        if (String.valueOf(this.id).equals("null")) return "<id></id><username></username>";
        return "<id>" + this.id + "</id><username>"+ getMessage() +"</username>";
    }

    public String getMessage() {
        switch (this.id) {
            case "1":
                return "root@root.com";
            case "2":
                return "admin@root.com";
            case "3":
                return "staff1@root.com";
        }
        return "None";
    }

    public String getRequestBody(HttpServletRequest request) throws Exception{
        ServletInputStream is = null;
        try {
            is = request.getInputStream();
            StringBuilder sb = new StringBuilder();
            byte[] buf = new byte[1024];
            int len = 0;
            while ((len = is.read(buf)) != -1) {
                sb.append(new String(buf, 0, len));
            }
            //System.out.println(sb.toString());
            return sb.toString();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (is != null) {
                    is.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    private String safeXml(String xmlstring){
        String xml = xmlstring.toLowerCase();
        if(
                xml.contains("file:")
                || xml.contains("jar:")
                || xml.contains("ftp:")
                || xml.contains("netdoc:")
                || xml.contains("mailto:")
                || xml.contains("gopher:")
                || xml.contains("entity %")
        ){
            return null;
        }/*else if(xml.contains("http:") && isValidIPAddress(xml)){
            return null;
        }*/
        return xmlstring;
    }

    private boolean isValidIPAddress(String ipAddress) {
        if ((ipAddress != null) && (!ipAddress.isEmpty())) {
            return Pattern.matches("^[0-9]{1,3}(\\.[0-9]{1,3}){3}$", ipAddress);
        }
        return false;
    }
}
