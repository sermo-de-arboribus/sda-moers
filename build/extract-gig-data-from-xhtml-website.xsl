<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:json="http://www.w3.org/2005/xpath-functions"
    xmlns:sda="http://www.sermo-de-arboribus.de"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    exclude-result-prefixes="xs math"
    version="3.0">
    
    <xsl:param name="sourceFolder" select="'../src/data'"/>
    <xsl:param name="sourceCollection" select="collection(concat($sourceFolder, '?select=*.xhtml;recurse=no'))"/>

    <xsl:output method="text"/>
    
    <xsl:template match="/">
        <xsl:variable name="json">
            <json:array>
                <xsl:for-each-group select="$sourceCollection//main/div/div[@class eq 'row']/div/*" group-starting-with="h2">
                    <xsl:if test="local-name(current-group()[1]) eq 'h2'">
                        <xsl:message>**** Starting new festival group ****</xsl:message>
                        <xsl:variable name="festival" select="normalize-space(current-group()[1])"/>
                        <xsl:message><xsl:value-of select="$festival" /></xsl:message>
                        <xsl:for-each-group select="current-group()" group-starting-with="h4">
                            <xsl:if test="local-name(current-group()[1]) eq 'h4'">
                                <xsl:variable name="day" select="normalize-space(current-group()[1])"/>
                                <xsl:variable name="date" select="sda:parse-date($day)"/>
                                <xsl:message>---- Starting new day ----</xsl:message>
                                <xsl:value-of select="$day"/>
                                <xsl:message><xsl:value-of select="$day"/></xsl:message>
                                <xsl:for-each select="current-group()[position() gt 1]">
                                    <xsl:variable name="description" select="normalize-space(sda:sanitize-string(node()[not(local-name() = ('strong', 'br'))]))"></xsl:variable>
                                    <xsl:if test="$description ne ''">
                                        <json:map>                                        
                                            <json:string key="id"><xsl:value-of select="generate-id()"/></json:string>
                                            <json:string key="name"><xsl:value-of select="sda:sanitize-string(strong[1])"/></json:string>
                                            <json:string key="description">Besetzung: <xsl:value-of select="$description"/></json:string>
                                            <json:string key="start_date"><xsl:value-of select="$date"/></json:string>
                                        </json:map>                                        
                                    </xsl:if>                                    
                                </xsl:for-each>
                            </xsl:if>
                        </xsl:for-each-group>                
                    </xsl:if>
                </xsl:for-each-group>                
            </json:array>
        </xsl:variable>
        
        <xsl:value-of select="$json => xml-to-json() => parse-json() => serialize(map{'indent':true(), 'method': 'json' })"/>
    </xsl:template>
    
    <xsl:function name="sda:parse-date" as="xs:string*">
        <xsl:param name="german-date-string"/>
        <xsl:analyze-string select="$german-date-string" regex="([0-3]?[0-9])\.\s+(Mai|Juni)\s+([1-2][0-9]{{3}})">
            <xsl:matching-substring>
                <xsl:variable name="day">
                    <xsl:value-of select="format-number(number(regex-group(1)), '00')"/>
                </xsl:variable>
                <xsl:variable name="month">
                    <xsl:choose>
                        <xsl:when test="regex-group(2) eq 'Mai'">05</xsl:when>
                        <xsl:otherwise>06</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:value-of select="concat(regex-group(3), '-', $month, '-', $day, ' 00:00:00')"/>
            </xsl:matching-substring>
        </xsl:analyze-string>
    </xsl:function>
    
    <xsl:function name="sda:sanitize-string" as="xs:string">
        <xsl:param name="dirty-strings" as="xs:string*"/>
        <xsl:variable name="joined-dirty-strings" select="string-join($dirty-strings, ' ')"/>
        <xsl:value-of select="replace(
                replace(
                    replace($joined-dirty-strings, '&#x0096;', ''),
                '&#x0097;', ''),
            '&#x00A0;', ' ')"/>
    </xsl:function>
</xsl:stylesheet>