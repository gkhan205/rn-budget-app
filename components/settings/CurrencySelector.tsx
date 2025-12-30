import { IconSymbol } from '@/components/ui/icon-symbol';
import { Currency } from '@/state/settingsStore';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  currencies: Currency[];
  onSelect: (currency: Currency) => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    subText: string;
    primaryBlue: string;
    border: string;
  };
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  currencies,
  onSelect,
  colors,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Currency Selector Button */}
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsModalVisible(true)}>
        <View style={styles.selectorContent}>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>
              {selectedCurrency.symbol}
            </Text>
            <View style={styles.currencyDetails}>
              <Text style={[styles.currencyName, { color: colors.text }]}>
                {selectedCurrency.name}
              </Text>
              <Text style={[styles.currencyCode, { color: colors.subText }]}>
                {selectedCurrency.code} • {selectedCurrency.country}
              </Text>
            </View>
          </View>
          <IconSymbol name='chevron.right' size={16} color={colors.subText} />
        </View>
      </TouchableOpacity>

      {/* Currency Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setIsModalVisible(false)}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}>
          {/* Modal Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <IconSymbol name='xmark' size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Currency
            </Text>
            <View style={styles.closeButton} />
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}>
            <IconSymbol
              name='magnifyingglass'
              size={16}
              color={colors.subText}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder='Search currencies...'
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize='none'
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol
                  name='xmark.circle.fill'
                  size={16}
                  color={colors.subText}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Currency List */}
          <ScrollView
            style={styles.currencyList}
            showsVerticalScrollIndicator={false}>
            {filteredCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSelect(currency)}>
                <View style={styles.currencyItemContent}>
                  <View style={styles.currencyInfo}>
                    <Text
                      style={[
                        styles.currencyItemSymbol,
                        { color: colors.text },
                      ]}>
                      {currency.symbol}
                    </Text>
                    <View style={styles.currencyDetails}>
                      <Text
                        style={[
                          styles.currencyItemName,
                          { color: colors.text },
                        ]}>
                        {currency.name}
                      </Text>
                      <Text
                        style={[
                          styles.currencyItemCode,
                          { color: colors.subText },
                        ]}>
                        {currency.code} • {currency.country}
                      </Text>
                    </View>
                  </View>
                  {selectedCurrency.code === currency.code && (
                    <IconSymbol
                      name='checkmark'
                      size={16}
                      color={colors.primaryBlue}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    borderRadius: 12,
    // borderWidth: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  currencyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  currencyItemSymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  currencyItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  currencyItemCode: {
    fontSize: 14,
  },
});
