import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 12,
  },
  section: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px #e0e7ef',
  },
  label: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    color: '#18181b',
    marginBottom: 4,
  },
  tagline: {
    fontStyle: 'italic',
    color: '#7c3aed',
    fontSize: 16,
    marginBottom: 8,
  },
});

const BrandKitPDF = ({ kit }: { kit: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{kit.brandName}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Tagline</Text>
        <Text style={styles.tagline}>{kit.tagline}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Color Palette</Text>
        <Text style={styles.value}>{kit.colorPalette}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Personality Traits</Text>
        <Text style={styles.value}>{kit.personalityTraits}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Profile Photo Style</Text>
        <Text style={styles.value}>{kit.profilePhotoStyle}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Username Suggestions</Text>
        <Text style={styles.value}>{kit.usernameSuggestions}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{kit.bio}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Content Ideas</Text>
        <Text style={styles.value}>{kit.contentIdeas}</Text>
      </View>
    </Page>
  </Document>
);

export default BrandKitPDF; 