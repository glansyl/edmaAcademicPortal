package com.eadms.util;

import com.eadms.exception.BadRequestException;

public class ValidationUtil {
    
    public static void validateMarks(Double marksObtained, Double maxMarks) {
        if (marksObtained < 0) {
            throw new BadRequestException("Marks obtained cannot be negative");
        }
        if (maxMarks <= 0) {
            throw new BadRequestException("Max marks must be positive");
        }
        if (marksObtained > maxMarks) {
            throw new BadRequestException("Marks obtained cannot exceed max marks");
        }
    }
    
    public static <E extends Enum<E>> void validateEnum(String value, Class<E> enumClass, String fieldName) {
        try {
            Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid " + fieldName + ": " + value);
        }
    }
}
