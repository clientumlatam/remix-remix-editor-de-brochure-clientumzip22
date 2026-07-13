<?php
/**
 * Plugin Name: Action Scheduler SQLite Compat (Replit)
 * Description: WooCommerce's Action Scheduler claims pending actions with a MySQL-only
 *              "UPDATE ... JOIN (SELECT ... FOR UPDATE) ..." query. The SQLite database
 *              integration plugin can't translate that syntax, so wp-cron requests fail
 *              with "Unable to claim actions. Database error" on every visit and queued
 *              tasks (WooCommerce emails, webhook retries, etc.) never run.
 *
 *              This swaps in a subclass that claims actions with two SQLite-safe
 *              queries (SELECT candidate IDs, then UPDATE ... WHERE action_id IN (...))
 *              instead of the single MySQL-specific atomic query. Safe for a
 *              single-process dev environment where there's no concurrent claimer to
 *              race against.
 */

add_filter(
	'action_scheduler_store_class',
	function ( $class ) {
		if ( ! class_exists( 'ActionScheduler_DBStore' ) ) {
			return $class;
		}

		if ( ! class_exists( 'Replit_ActionScheduler_SQLiteStore' ) ) {
			class Replit_ActionScheduler_SQLiteStore extends ActionScheduler_DBStore {
				/**
				 * SQLite-safe replacement for ActionScheduler_DBStore::claim_actions().
				 *
				 * Same behavior as core, minus the MySQL-only UPDATE...JOIN / FOR UPDATE /
				 * SKIP LOCKED syntax that the SQLite integration plugin can't parse.
				 */
				protected function claim_actions( $claim_id, $limit, ?DateTime $before_date = null, $hooks = array(), $group = '' ) {
					global $wpdb;

					$now  = as_get_datetime_object();
					$date = is_null( $before_date ) ? $now : clone $before_date;

					if ( ! empty( $hooks ) ) {
						$this->set_claim_filter( 'hooks', $hooks );
					} else {
						$hooks = $this->get_claim_filter( 'hooks' );
					}
					if ( ! empty( $group ) ) {
						$this->set_claim_filter( 'group', $group );
					} else {
						$group = $this->get_claim_filter( 'group' );
					}

					$where        = 'WHERE claim_id = 0 AND scheduled_date_gmt <= %s AND status=%s';
					$where_params = array(
						$date->format( 'Y-m-d H:i:s' ),
						self::STATUS_PENDING,
					);

					if ( ! empty( $hooks ) ) {
						$placeholders = array_fill( 0, count( $hooks ), '%s' );
						$where       .= ' AND hook IN (' . join( ', ', $placeholders ) . ')';
						$where_params = array_merge( $where_params, array_values( $hooks ) );
					}

					$group_operator = 'IN';
					if ( empty( $group ) ) {
						$group          = $this->get_claim_filter( 'exclude-groups' );
						$group_operator = 'NOT IN';
					}

					if ( ! empty( $group ) ) {
						$group_ids = $this->get_group_ids( $group, false );

						if ( empty( $group_ids ) ) {
							throw new InvalidArgumentException(
								sprintf(
									/* translators: %s: group name(s) */
									_n(
										'The group "%s" does not exist.',
										'The groups "%s" do not exist.',
										is_array( $group ) ? count( $group ) : 1,
										'woocommerce'
									),
									$group
								)
							);
						}

						$id_list = implode( ',', array_map( 'intval', $group_ids ) );
						$where  .= " AND group_id {$group_operator} ( $id_list )";
					}

					$order = apply_filters(
						'action_scheduler_claim_actions_order_by',
						'ORDER BY priority ASC, attempts ASC, scheduled_date_gmt ASC, action_id ASC',
						$claim_id,
						$hooks
					);

					// Step 1: find candidate action IDs (no FOR UPDATE / SKIP LOCKED).
					$select_sql = $wpdb->prepare(
						"SELECT action_id FROM {$wpdb->actionscheduler_actions} {$where} {$order} LIMIT %d",
						array_merge( $where_params, array( $limit ) )
					);

					$action_ids = $wpdb->get_col( $select_sql );

					if ( empty( $action_ids ) ) {
						return 0;
					}

					// Step 2: claim them with a plain UPDATE ... WHERE IN (...), no JOIN.
					$id_list_sql = implode( ',', array_map( 'intval', $action_ids ) );
					$update_sql  = $wpdb->prepare(
						"UPDATE {$wpdb->actionscheduler_actions} SET claim_id = %d, last_attempt_gmt = %s, last_attempt_local = %s WHERE action_id IN ( $id_list_sql )",
						$claim_id,
						$now->format( 'Y-m-d H:i:s' ),
						current_time( 'mysql' )
					);

					$rows_affected = $wpdb->query( $update_sql );

					if ( false === $rows_affected ) {
						$error = empty( $wpdb->last_error )
							? _x( 'unknown', 'database error', 'woocommerce' )
							: $wpdb->last_error;
						throw new \RuntimeException(
							sprintf(
								/* translators: %s database error. */
								__( 'Unable to claim actions. Database error: %s.', 'woocommerce' ),
								$error
							)
						);
					}

					return (int) $rows_affected;
				}
			}
		}

		return 'Replit_ActionScheduler_SQLiteStore';
	},
	100
);
