// File generated from our OpenAPI spec

declare module 'stripe' {
  namespace Stripe {
    /**
     * The IssuerFraudRecord object.
     */
    interface IssuerFraudRecord {
      /**
       * Unique identifier for the object.
       */
      id: string;

      /**
       * String representing the object's type. Objects of the same type share the same value.
       */
      object: 'issuer_fraud_record';

      /**
       * An IFR is actionable if it has not received a dispute and has not been fully refunded. You may wish to proactively refund a charge that receives an IFR, in order to avoid receiving a dispute later.
       */
      actionable: boolean;

      /**
       * ID of the charge this issuer fraud record is for, optionally expanded.
       */
      charge: string | Stripe.Charge;

      /**
       * Time at which the object was created. Measured in seconds since the Unix epoch.
       */
      created: number;

      /**
       * The type of fraud labelled by the issuer. One of `card_never_received`, `fraudulent_card_application`, `made_with_counterfeit_card`, `made_with_lost_card`, `made_with_stolen_card`, `misc`, `unauthorized_use_of_card`.
       */
      fraud_type: string;

      /**
       * If true, the associated charge is subject to [liability shift](https://stripe.com/docs/payments/3d-secure#disputed-payments).
       */
      has_liability_shift: boolean;

      /**
       * Has the value `true` if the object exists in live mode or the value `false` if the object exists in test mode.
       */
      livemode: boolean;

      /**
       * The timestamp at which the card issuer posted the issuer fraud record.
       */
      post_date: number;
    }

    interface IssuerFraudRecordRetrieveParams {
      /**
       * Specifies which fields in the response should be expanded.
       */
      expand?: Array<string>;
    }

    interface IssuerFraudRecordListParams extends PaginationParams {
      /**
       * Only return issuer fraud records for the charge specified by this charge ID.
       */
      charge?: string;

      /**
       * Specifies which fields in the response should be expanded.
       */
      expand?: Array<string>;
    }

    class IssuerFraudRecordsResource {
      /**
       * Retrieves the details of an issuer fraud record that has previously been created.
       *
       * Please refer to the [issuer fraud record](https://stripe.com/docs/api#issuer_fraud_record_object) object reference for more details.
       */
      retrieve(
        id: string,
        params?: IssuerFraudRecordRetrieveParams,
        options?: RequestOptions
      ): Promise<Stripe.Response<Stripe.IssuerFraudRecord>>;
      retrieve(
        id: string,
        options?: RequestOptions
      ): Promise<Stripe.Response<Stripe.IssuerFraudRecord>>;

      /**
       * Returns a list of issuer fraud records.
       */
      list(
        params?: IssuerFraudRecordListParams,
        options?: RequestOptions
      ): ApiListPromise<Stripe.IssuerFraudRecord>;
      list(options?: RequestOptions): ApiListPromise<Stripe.IssuerFraudRecord>;
    }
  }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        // File generated from our OpenAPI spec

declare module 'stripe' {
  namespace Stripe {
    /**
     * The LineItem object.
     */
    interface LineItem {
      /**
       * Unique identifier for the object.
       */
      id: string;

      /**
       * String representing the object's type. Objects of the same type share the same value.
       */
      object: 'item';

      /**
       * Total before any discounts or taxes are applied.
       */
      amount_subtotal: number;

      /**
       * Total after discounts and taxes.
       */
      amount_total: number;

      /**
       * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase. Must be a [supported currency](https://stripe.com/docs/currencies).
       */
      currency: string;

      /**
       * An arbitrary string attached to the object. Often useful for displaying to users. Defaults to product name.
       */
      description: string;

      /**
       * The discounts applied to the line item.
       */
      discounts?: Array<LineItem.Discount>;

      /**
       * The price used to generate the line item.
       */
      price: Stripe.Price | null;

      /**
       * The quantity of products being purchased.
       */
      quantity: number | null;

      /**
       * The taxes applied to the line item.
       */
      taxes?: Array<LineItem.Tax>;
    }

    namespace LineItem {
      interface Discount {
        /**
         * The amount discounted.
         */
        amount: number;

        /**
         * A discount represents the actual application of a coupon to a particular
         * customer. It contains informat