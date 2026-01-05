package com.eadms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    
    private Long id;
    private String courseCode;
    private String courseName;
    private Integer semester;
    private Integer credits;
    private String description;
    private List<Long> teacherIds;
    private List<String> teacherNames;
}
