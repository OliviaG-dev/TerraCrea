import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { COLORS } from "../utils/colors";

const { width } = Dimensions.get("window");

interface SuggestionItem {
  id: string;
  text: string;
  type?: string;
  icon?: string;
}

interface AutoSuggestInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  suggestions: SuggestionItem[];
  onSuggestionSelect?: (suggestion: SuggestionItem) => void;
  maxSuggestions?: number;
  style?: any;
  inputStyle?: any;
  onSuggestionsFetchRequested?: (query: string) => void;
  onSuggestionsClearRequested?: () => void;
}

export const AutoSuggestInput: React.FC<AutoSuggestInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  suggestions,
  onSuggestionSelect,
  maxSuggestions = 5,
  style,
  inputStyle,
  onSuggestionsFetchRequested,
  onSuggestionsClearRequested,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionItem[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value.trim().length > 0 && suggestions.length > 0) {
      const filtered = suggestions
        .filter(item => 
          item.text.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxSuggestions);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions, maxSuggestions]);

  const handleInputChange = (text: string) => {
    onChangeText(text);
    if (onSuggestionsFetchRequested && text.trim().length > 0) {
      onSuggestionsFetchRequested(text);
    } else if (onSuggestionsClearRequested) {
      onSuggestionsClearRequested();
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    onChangeText(suggestion.text);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (value.trim().length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Délai pour permettre la sélection d'une suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const renderSuggestionItem = ({ item }: { item: SuggestionItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      {item.icon && (
        <Text style={styles.suggestionIcon}>{item.icon}</Text>
      )}
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.text}</Text>
        {item.type && (
          <Text style={styles.suggestionType}>{item.type}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor="#8a9a8a"
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredSuggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e8e9e8",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fafaf9",
    color: "#4a5c4a",
    fontFamily: "System",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e9e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: "#4a5c4a",
    fontWeight: "500",
  },
  suggestionType: {
    fontSize: 12,
    color: "#8a9a8a",
    marginTop: 2,
  },
});
