// import React from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   TouchableOpacity
// } from 'react-native';

// const MindMapScreen = ({ route, navigation }: any) => {
//   const { content = '', title = 'Mind Map', imageUri, allImages = [] } = route.params ?? {};
//   const lines = content.split('\n').filter((line: string) => line.trim() !== '');

//   let finalUri = null;
//   try {
//     // If it's a JSON string array from the DB, parse it and take the first one
//     const parsed = JSON.parse(imageUri);
//     if (Array.isArray(parsed) && parsed.length > 0) {
//       finalUri = parsed[0];
//     } else {
//       finalUri = imageUri;
//     }
//   } catch (e) {
//     // If it's not JSON, just use the raw string
//     finalUri = imageUri;
//   }

//   // Ensure local paths have the correct prefix for Android
//   if (finalUri && !finalUri.startsWith('http') && !finalUri.startsWith('file://') && !finalUri.startsWith('content://')) {
//     finalUri = `file://${finalUri}`;
//   }

//   return (
//     <View style={mapStyles.root}>
//       {/* ── Header (Aligned with NoteEditor) ── */}
//       <View style={mapStyles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={mapStyles.backBtn}>
//           <Text style={mapStyles.backBtnText}>← Back</Text>
//         </TouchableOpacity>
//         <Text style={mapStyles.headerTitle}>Mind Map</Text>
//         {/* Placeholder for symmetry */}
//         <View style={{ width: 50 }} />
//       </View>

//       {/* ── Map Content ── */}
//       <ScrollView contentContainerStyle={mapStyles.container} horizontal={true}>
//         <ScrollView contentContainerStyle={mapStyles.verticalContent}>

//           {/* Core Node: Matches "Save" Button Styling */}
//           <View style={mapStyles.rootNode}>
//             <Text style={mapStyles.rootNodeText}>{title || "My Note"}</Text>
//           </View>

//           <View style={mapStyles.verticalLine} />

//           <View style={mapStyles.branchContainer}>
//             {/* Image Branch */}
//             {finalUri && ( // Use finalUri instead of imageUri
//               <View style={mapStyles.nodeWrapper}>
//                 <View style={mapStyles.connectorLine} />
//                 <View style={mapStyles.imageNode}>
//                   <Image
//                     source={{ uri: finalUri }} // Use the cleaned URI
//                     style={mapStyles.mapImage}
//                     resizeMode="cover"
//                     // Add an onError to debug if it fails
//                     onError={(e) => console.log("MindMap Image Load Error:", e.nativeEvent.error)}
//                   />
//                   <Text style={mapStyles.imageLabel}>Attached Image</Text>
//                 </View>
//               </View>
//             )}

//             {/* Text Branches: Matches Segment Styling */}
//             {lines.map((line: string, i: number) => (
//               <View key={i} style={mapStyles.nodeWrapper}>
//                 <View style={mapStyles.connectorLine} />
//                 <View style={mapStyles.branchNode}>
//                   <Text style={mapStyles.branchText}>{line}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </ScrollView>
//       </ScrollView>
//     </View>
//   );
// };


// const mapStyles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: '#f4f7f5', // Matches NoteEditor root background
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//     elevation: 2,
//   },
//   backBtn: {
//     paddingHorizontal: 4,
//   },
//   backBtnText: {
//     fontSize: 15,
//     color: '#3dc9f3',
//     fontWeight: '600',
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   container: {
//     minWidth: '100%',
//   },
//   verticalContent: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   rootNode: {
//     backgroundColor: '#3dc9f3',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12, // Matches your button border radius
//     elevation: 3,
//   },
//   rootNodeText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   verticalLine: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#d1d5db',
//   },
//   branchContainer: {
//     alignItems: 'flex-start',
//   },
//   nodeWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   connectorLine: {
//     width: 25,
//     height: 2,
//     backgroundColor: '#d1d5db',
//   },
//   imageLabel: {
//     fontSize: 10,
//     color: '#94a3b8',
//     marginTop: 4,
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   branchNode: {
//     backgroundColor: '#ffffff',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3dc9f3', // Using your primary theme color
//     maxWidth: 260,
//     elevation: 1,
//   },
//   branchText: {
//     color: '#1f2937',
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   imageNode: {
//     backgroundColor: '#ffffff',
//     padding: 6,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   mapImage: {
//     width: 120,
//     height: 80,
//     borderRadius: 4,
//   },
// });

// export default MindMapScreen;

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';

const MindMapScreen = ({ route, navigation }: any) => {
  // Destructure allImages along with other params
  const { content = '', title = 'Mind Map', imageUri, allImages = [] } = route.params ?? {};
  const lines = content.split('\n').filter((line: string) => line.trim() !== '');

  /**
   * Helper to ensure local paths have the correct prefix for Android
   */
  const formatUri = (uri: string | null) => {
    if (!uri) return '';
    if (!uri.startsWith('http') && !uri.startsWith('file://') && !uri.startsWith('content://')) {
      return `file://${uri}`;
    }
    return uri;
  };

  /**
   * Resolve images: Priority to allImages array, 
   * fallback to imageUri if array is empty.
   */
  let imageList: string[] = [];
  if (Array.isArray(allImages) && allImages.length > 0) {
    imageList = allImages;
  } else if (imageUri) {
    try {
      const parsed = JSON.parse(imageUri);
      imageList = Array.isArray(parsed) ? parsed : [imageUri];
    } catch (e) {
      imageList = [imageUri];
    }
  }

  return (
    <View style={mapStyles.root}>
      {/* Header */}
      <View style={mapStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={mapStyles.backBtn}>
          <Text style={mapStyles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={mapStyles.headerTitle}>Mind Map</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Map Content */}
      <ScrollView contentContainerStyle={mapStyles.container} horizontal={true}>
        <ScrollView contentContainerStyle={mapStyles.verticalContent}>

          {/* Core Node */}
          <View style={mapStyles.rootNode}>
            <Text style={mapStyles.rootNodeText}>{title || "My Note"}</Text>
          </View>

          <View style={mapStyles.verticalLine} />

          <View style={mapStyles.branchContainer}>

            {/* ── Multiple Image Branches ── */}
            {imageList.map((uri, index) => {
              const formatted = formatUri(uri);
              if (!formatted) return null; // Skip rendering if uri is empty

              return (
                <View key={`img-${index}`} style={mapStyles.nodeWrapper}>
                  <View style={mapStyles.connectorLine} />
                  <View style={mapStyles.imageNode}>
                    <Image
                      source={{ uri: formatted || '' }}
                      style={mapStyles.mapImage}
                      resizeMode="cover"
                    />
                    <Text style={mapStyles.imageLabel}>Image {index + 1}</Text>
                  </View>
                </View>
              );
            })}

            {/* ── Text Branches ── */}
            {lines.map((line: string, i: number) => (
              <View key={`line-${i}`} style={mapStyles.nodeWrapper}>
                <View style={mapStyles.connectorLine} />
                <View style={mapStyles.branchNode}>
                  <Text style={mapStyles.branchText}>{line}</Text>
                </View>
              </View>
            ))}

          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const mapStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f7f5', // Matches NoteEditor root background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
  },
  backBtn: {
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 15,
    color: '#3dc9f3',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  container: {
    minWidth: '100%',
  },
  verticalContent: {
    alignItems: 'center',
    padding: 40,
  },
  rootNode: {
    backgroundColor: '#3dc9f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12, // Matches your button border radius
    elevation: 3,
  },
  rootNodeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  verticalLine: {
    width: 2,
    height: 30,
    backgroundColor: '#d1d5db',
  },
  branchContainer: {
    alignItems: 'flex-start',
  },
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectorLine: {
    width: 25,
    height: 2,
    backgroundColor: '#d1d5db',
  },
  imageLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  branchNode: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3dc9f3', // Using your primary theme color
    maxWidth: 260,
    elevation: 1,
  },
  branchText: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 20,
  },
  imageNode: {
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 8,
    elevation: 2,
  },
  mapImage: {
    width: 120,
    height: 80,
    borderRadius: 4,
  },
});

export default MindMapScreen;