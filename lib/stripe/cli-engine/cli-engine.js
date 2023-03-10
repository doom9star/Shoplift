import {StripeElementBase} from './base';

export type StripePaymentElement = StripeElementBase & {
  /**
   * The change event is triggered when the `Element`'s value changes.
   */
  on(
    eventType: 'change',
    handler: (event: StripePaymentElementChangeEvent) => any
  ): StripePaymentElement;
  once(
    eventType: 'change',
    handler: (event: StripePaymentElementChangeEvent) => any
  ): StripePaymentElement;
  off(
    eventType: 'change',
    handler?: (event: StripePaymentElementChangeEvent) => any
  ): StripePaymentElement;

  /**
   * Triggered when the element is fully rendered and can accept `element.focus` calls.
   */
  on(
    eventType: 'ready',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  once(
    eventType: 'ready',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  off(
    eventType: 'ready',
    handler?: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;

  /**
   * Triggered when the element gains focus.
   */
  on(
    eventType: 'focus',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  once(
    eventType: 'focus',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  off(
    eventType: 'focus',
    handler?: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;

  /**
   * Triggered when the element loses focus.
   */
  on(
    eventType: 'blur',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  once(
    eventType: 'blur',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  off(
    eventType: 'blur',
    handler?: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;

  /**
   * Triggered when the escape key is pressed within the element.
   */
  on(
    eventType: 'escape',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  once(
    eventType: 'escape',
    handler: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;
  off(
    eventType: 'escape',
    handler?: (event: {elementType: 'payment'}) => any
  ): StripePaymentElement;

  /**
   * Updates the options the `PaymentElement` was initialized with.
   * Updates are merged into the existing configuration.
   */
  update(options: Partial<StripePaymentElementOptions>): StripePaymentElement;

  /**
   * Collapses the Payment Element into a row of payment method tabs.
   */
  collapse(): StripePaymentElement;
};

export type FieldOption = 'auto' | 'never';

export interface FieldsOption {
  billingDetails?:
    | FieldOption
    | {
        name?: FieldOption;
        email?: FieldOption;
        phone?: FieldOption;
        address?:
          | FieldOption
          | {
              country?: FieldOption;
              postalCode?: FieldOption;
              state?: FieldOption;
              city?: FieldOption;
              line1?: FieldOption;
              line2?: FieldOption;
            };
      };
}

export type TermOption = 'auto' | 'always' | 'never';

export interface TermsOption {
  bancontact?: TermOption;
  card?: TermOption;
  ideal?: TermOption;
  sepaDebit?: TermOption;
  sofort?: TermOption;
  auBecsDebit?: TermOption;
  usBankAccount?: TermOption;
}

export type WalletOption = 'auto' | 'never';

export interface WalletsOption {
  applePay?: WalletOption;
  googlePay?: WalletOption;
}

export interface StripePaymentElementOptions {
  /**
   * Override the business name displayed in the Payment Element.
   * By default the PaymentElement will use your Stripe account or business name.
   */
  business?: {name: string};

  /**
   * Override the order in which payment methods are displayed in the Payment Element.
   * By default, the Payment Element will use a dynamic ordering that optimizes payment method display for each user.
   */
  paymentMethodOrder?: string[];

  /**
   * Control which fields are displayed in the Payment Element.
   */
  fields?: FieldsOption;

  /**
   * Apply a read-only state to the Payment Element so that payment details can???t be changed.
   * Default is false.
   */
  readOnly?: boolean;

  /**
   * Control terms display in the Payment Element.
   */
  terms?: TermsOption;

  /**
   * Control wallets display in the Payment Element.
   */
  wallets?: WalletsOption;
}

export interface StripePaymentElementChangeEvent {
  /**
   * The type of element that emitted this event.
   */
  elementType: 'payment';

  /**
   * `true` if the all inputs in the Payment Element are empty.
   */
  empty: boolean;

  /**
   * `true` if the every input in the Payment Element is well-formed and potentially complete.
   */
  complete: boolean;

  /**
   * Whether or not the Payment Element is currently collapsed.
   */
  collapsed: boolean;

  /**
   * An object containing the currently selected PaymentMethod type (in snake_case, for example "afterpay_clearpay").
   */
  value: {type: string};
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        import {StripeElementBase, StripeElementChangeEvent} from './base';

export type StripeShippingAddressElement = StripeElementBase & {
  /**
   * The change event is triggered when the `Element`'s value changes.
   */
  on(
    eventType: 'change',
    handler: (event: StripeShippingAddressElementChangeEvent) => any
  ): StripeShippingAddressElement;
  once(
    eventType: 'change',
    handler: (event: StripeShippingAddressElementChangeEvent) => any
  ): StripeShippingAddressElement;
  off(
    eventType: 'change',
    handler?: (event: StripeShippingAddressElementChangeEvent) => any
  ): StripeShippingAddressElement;

  /**
   * Triggered when the element is fully rendered and can accept `element.focus` calls.
   */
  on(
    eventType: 'ready',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  once(
    eventType: 'ready',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  off(
    eventType: 'ready',
    handler?: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;

  /**
   * Triggered when the element gains focus.
   */
  on(
    eventType: 'focus',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  once(
    eventType: 'focus',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  off(
    eventType: 'focus',
    handler?: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;

  /**
   * Triggered when the element loses focus.
   */
  on(
    eventType: 'blur',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  once(
    eventType: 'blur',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  off(
    eventType: 'blur',
    handler?: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;

  /**
   * Triggered when the escape key is pressed within the element.
   */
  on(
    eventType: 'escape',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  once(
    eventType: 'escape',
    handler: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;
  off(
    eventType: 'escape',
    handler?: (event: {elementType: 'shippingAddress'}) => any
  ): StripeShippingAddressElement;

  /**
   * Updates the options the `ShippingAddressElement` was initialized with.
   * Updates are merged into the existing configuration.
   */
  update(
    options: Partial<StripeShippingAddressElementOptions>
  ): StripeShippingAddressElement;
};

export interface StripeShippingAddressElementOptions {
  /**
   * Control which countries are displayed in the shippingAddress Element.
   */
  allowedCountries?: string[] | null;
}

export interface StripeShippingAddressElementChangeEvent
  extends StripeElementChangeEvent {
  /**
   * The type of element that emitted this event.
   */
  elementType: 'shippingAddress';

  /**
   * Whether or not the shippingAddress Element is currently empty.
   */
  empty: boolean;

  /**
   * Whether or not the shippingAddress Element is complete.
   */
  complete: boolean;

  /**
   * Whether or not the the shipping address is new.
   */
  isNewAddress: boolean;

  /**
   * An object containing the current address.
   */
  value: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    locality: string;
    administrativeArea: string;
    postalCode: string;
    country: string;
    dependentLocality: string;
    sortingCode: string;
  };
}
                                                                                                                                                                                                                                                                                                                                                                                                                                    d but we need to recurse down its
  // children to find all the terminal nodes.
  var node = current; // Each iteration, currentParent is populated with node's host parent if not
  // currentParentIsValid.

  var currentParentIsValid = false; // Note: these two variables *must* always be updated together.

  var currentParent;
  var currentParentIsContainer;

  while (true) {
    if (!currentParentIsValid) {
      var parent = node.return;

      findParent: while (true) {
        if (!(parent !== null)) {
          {
            throw Error( "Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue." );
          }
        }

        var parentStateNode = parent.stateNode;

        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode;
            currentParentIsContainer = false;
            break findParent;

          case HostRoot:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;

          case HostPortal:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;

        }

        parent = parent.return;
      }

      currentParentIsValid = true;
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      commitNestedUnmounts(finishedRoot, node); // After all the children have unmounted, it is now safe to remove the
      // node from the tree.

      if (currentParentIsContainer) {
        removeChildFromContainer(currentParent, node.stateNode);
      } else {
        removeChild(currentParent, node.stateNode);
      } // Don't visit children because we already visited them.

    } else if (node.tag === HostPortal) {
      if (node.child !== null) {
        // When we go into a portal, it becomes the parent to remove from.
        // We will reassign it back when we pop the portal on the way up.
        currentParent = node.stateNode.containerInfo;
        currentParentIsContainer = true; // Visit children because portals might contain host components.

        node.child.return = node;
        node = node.child;
        continue;
      }
    } else {
      commitUnmount(finishedRoot, node); // Visit children because we may find more host components below.

      if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
    }

    if (node === current) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === current) {
        return;
      }

      node = node.return;

      if (node.tag === HostPortal) {
        // When we go out of the portal, we need to restore the parent.
        // Since we don't keep a stack of them, we will search for it.
        currentParentIsValid = false;
      }
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function commitDeletion(finishedRoot, current, renderPriorityLevel) {
  {
    // Recursively delete all host nodes from the parent.
    // Detach refs and call componentWillUnmount() on the whole subtree.
    unmountHostComponents(finishedRoot, current);
  }

  var alternate = current.alternate;
  detachFiberMutation(current);

  if (alternate !== null) {
    detachFiberMutation(alternate);
  }
}

function commitWork(current, finishedWork) {

  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent:
    case Block:
      {
        // Layout effects are destroyed during the mutation phase so that all
        // destroy functions for all fibers are called before any create functions.
        // This prevents sibling component effects from interfering with each other,
        // e.g. a destroy function in one component should never override a ref set
        // by a create function in another component during the same commit.
        {
          commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
        }

        return;
      }

    case ClassComponent:
      {
        return;
      }

    case HostComponent:
      {
        var instance = finishedWork.stateNode;

        if (instance != null) {
          // Commit the work prepared earlier.
          var newProps = finishedWork.memoizedProps; // For hydration we reuse the update path but we treat the oldProps
          // as the newProps. The updatePayload will contain the real change in
          // this case.

          var oldProps = current !== null ? current.memoizedProps : newProps;
          var type = finishedWork.type; // TODO: Type the updateQueue to be specific to host components.

          var updatePayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null;

          if (updatePayload !== null) {
            commitUpdate(instance, updatePayload, type, oldProps, newProps);
          }
        }

        return;
      }

    case HostText:
      {
        if (!(finishedWork.stateNode !== null)) {
          {
            throw Error( "This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue." );
          }
        }

        var textInstance = finishedWork.stateNode;
        var newText = finishedWork.memoizedProps; // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.

        var oldText = current !== null ? current.memoizedProps : newText;
        commitTextUpdate(textInstance, oldText, newText);
        return;
      }

    case HostRoot:
      {
        {
          var _root = finishedWork.stateNode;

          if (_root.hydrate) {
            // We've just hydrated. No need to hydrate again.
            _root.hydrate = false;
            commitHydratedContainer(_root.containerInfo);
          }
        }

        return;
      }

    case Profiler:
      {
        return;
      }

    case SuspenseComponent:
      {
        commitSuspenseComponent(finishedWork);
        attachSuspenseRetryListeners(finishedWork);
        return;
      }

    case SuspenseListComponent:
      {
        attachSuspenseRetryListeners(finishedWork);
        return;
      }

    case IncompleteClassComponent:
      {
        return;
      }

    case FundamentalComponent:
      {

        break;
      }

    case ScopeComponent:
      {

        break;
      }

    case OffscreenComponent:
    case LegacyHiddenComponent:
      {
        var newState = finishedWork.memoizedState;
        var isHidden = newState !== null;
        hideOrUnhideAllChildren(finishedWork, isHidden);
        return;
      }
  }

  {
    {
      throw Error( "This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue." );
    }
  }
}

function commitSuspenseComponent(finishedWork) {
  var newState = finishedWork.memoizedState;

  if (newState !== null) {
    markCommitTimeOfFallback();

    {
      // Hide the Offscreen component that contains the primary children. TODO:
      // Ideally, this effect would have been scheduled on the Offscreen fiber
      // itself. That's how unhiding works: the Offscreen component schedules an
      // effect on itself. However, in this case, the component didn't complete,
      // so the fiber was never added to the effect list in the normal path. We
      // could have appended it to the effect list in the Suspense component's
      // second pass, but doing it this way is less complicated. This would be
      // simpler if we got rid of the effect list and traversed the tree, like
      // we're planning to do.
      var primaryChildParent = finishedWork.child;
      hideOrUnhideAllChildren(primaryChildParent, true);
    }
  }
}

function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {

  var newState = finishedWork.memoizedState;

  if (newState === null) {
    var current = finishedWork.alternate;

    if (current !== null) {
      var prevState = current.memoizedState;

      if (prevState !== null) {
        var suspenseInstance = prevState.dehydrated;

        if (suspenseInstance !== null) {
          commitHydratedSuspenseInstance(suspenseInstance);
        }
      }
    }
  }
}

function attachSuspenseRetryListeners(finishedWork) {
  // If this boundary just timed out, then it will have a set of wakeables.
  // For each wakeable, attach a listener so that when it resolves, React
  // attempts to re-render the boundary in the primary (pre-timeout) state.
  var wakeables = finishedWork.updateQueue;

  if (wakeables !== null) {
    finishedWork.updateQueue = null;
    var retryCache = finishedWork.stateNode;

    if (retryCache === null) {
      retryCache = finishedWork.stateNode = new PossiblyWeakSet();
    }

    wakeables.forEach(function (wakeable) {
      // Memoize using the boundary fiber to prevent redundant listeners.
      var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);

      if (!retryCache.has(wakeable)) {
        {
          if (wakeable.__reactDoNotTraceInteractions !== true) {
            retry = tracing.unstable_wrap(retry);
          }
        }

        retryCache.add(wakeable);
        wakeable.then(retry, retry);
      }
    });
  }
} // This function detects when a Suspense boundary goes from visible to hidden.
// It returns false if the boundary is already hidden.
// TODO: Use an effect tag.


function isSuspenseBoundaryBeingHidden(current, finishedWork) {
  if (current !== null) {
    var oldState = current.memoizedState;

    if (oldState === null || oldState.dehydrated !== null) {
      var newState = finishedWork.memoizedState;
      return newState !== null && newState.dehydrated === null;
    }
  }

  return false;
}

function commitResetTextContent(current) {

  resetTextContent(current.stateNode);
}

var COMPONENT_TYPE = 0;
var HAS_PSEUDO_CLASS_TYPE = 1;
var ROLE_TYPE = 2;
var TEST_NAME_TYPE = 3;
var TEXT_TYPE = 4;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor$1 = Symbol.for;
  COMPONENT_TYPE = symbolFor$1('selector.component');
  HAS_PSEUDO_CLASS_TYPE = symbolFor$1('selector.has_pseudo_class');
  ROLE_TYPE = symbolFor$1('selector.role');
  TEST_NAME_TYPE = symbolFor$1('selector.test_id');
  TEXT_TYPE = symbolFor$1('selector.text');
}
var commitHooks = [];
function onCommitRoot$1() {
  {
    commitHooks.forEach(function (commitHook) {
      return commitHook();
    });
  }
}

var ceil = Math.ceil;
var ReactCurrentDispatcher$2 = ReactSharedInternals.ReactCurrentDispatcher,
    ReactCurrentOwner$2 = ReactSharedInternals.ReactCurrentOwner,
    IsSomeRendererActing = ReactSharedInternals.IsSomeRendererActing;
var NoContext =
/*             */
0;
var BatchedContext =
/*               */
1;
var EventContext =
/*                 */
2;
var DiscreteEventContext =
/*         */
4;
var LegacyUnbatchedContext =
/*       */
8;
var RenderContext =
/*                */
16;
var CommitContext =
/*                */
32;
var RetryAfterError =
/*       */
64;
var RootIncomplete = 0;
var RootFatalErrored = 1;
var RootErrored = 2;
var RootSuspended = 3;
var RootSuspendedWithDelay = 4;
var RootCompleted = 5; // Describes where we are in the React execution stack

var executionContext = NoContext; // The root we're working on

var workInProgressRoot = null; // The fiber we're working on

var workInProgress = null; // The lanes we're rendering

var workInProgressRootRenderLanes = NoLanes; // Stack that allows components to change the render lanes for its subtree
// This is a superset of the lanes we started working on at the root. The only
// case where it's different from `workInProgressRootRenderLanes` is when we
// enter a subtree that is hidden and needs to be unhidden: Suspense and
// Offscreen component.
//
// Most things in the work loop should deal with workInProgressRootRenderLanes.
// Most things in begin/complete phases should deal with subtreeRenderLanes.

var subtreeRenderLanes = NoLanes;
var subtreeRenderLanesCursor = createCursor(NoLanes); // Whether to root completed, errored, suspended, etc.

var workInProgressRootExitStatus = RootIncomplete; // A fatal error, if one is thrown

var workInProgressRootFatalError = null; // "Included" lanes refer to lanes that were worked on during this render. It's
// slightly different than `renderLanes` because `renderLanes` can change as you
// enter and exit an Offscreen tree. This value is the combination of all render
// lanes for the entire render phase.

var workInProgressRootIncludedLanes = NoLanes; // The work left over by components that were visited during this render. Only
// includes unprocessed updates, not work in bailed out children.

var workInProgressRootSkippedLanes = NoLanes; // Lanes that were updated (in an interleaved event) during this render.

var workInProgressRootUpdatedLanes = NoLanes; // Lanes that were pinged (in an interleaved event) during this render.

var workInProgressRootPingedLanes = NoLanes;
var mostRecentlyUpdatedRoot = null; // The most recent time we committed a fallback. This lets us ensure a train
// model where we don't commit new loading states in too quick succession.

var globalMostRecentFallbackTime = 0;
var FALLBACK_THROTTLE_MS = 500; // The absolute time for when we should start giving up on rendering
// more and prefer CPU suspense heuristics instead.

var workInProgressRootRenderTargetTime = Infinity; // How long a render is supposed to take before we start following CPU
// suspense heuristics and opt out of rendering more content.

var RENDER_TIMEOUT_MS = 500;

function resetRenderTimer() {
  workInProgressRootRenderTargetTime = now() + RENDER_TIMEOUT_MS;
}

function getRenderTargetTime() {
  return workInProgressRootRenderTargetTime;
}
var nextEffect = null;
var hasUncaughtError = false;
var firstUncaughtError = null;
var legacyErrorBoundariesThatAlreadyFailed = null;
var rootDoesHavePassiveEffects = false;
var rootWithPendingPassiveEffects = null;
var pendingPassiveEffectsRenderPriority = NoPriority$1;
var pendingPassiveEffectsLanes = NoLanes;
var pendingPassiveHookEffectsMount = [];
var pendingPassiveHookEffectsUnmount = [];
var rootsWithPendingDiscreteUpdates = null; // Use these to prevent an infinite loop of nested updates

var NESTED_UPDATE_LIMIT = 50;
var nestedUpdateCount = 0;
var rootWithNestedUpdates = null;
var NESTED_PASSIVE_UPDATE_LIMIT = 50;
var nestedPassiveUpdateCount = 0; // Marks the need to reschedule pending interactions at these lanes
// during the commit phase. This enables them to be traced across components
// that spawn new work during render. E.g. hidden boundaries, suspended SSR
// hydration or SuspenseList.
// TODO: Can use a bitmask instead of an array

var spawnedWorkDuringRender = null; // If two updates are scheduled within the same event, we should treat their
// event times as simultaneous, even if the actual clock time has advanced
// between the first and second call.

var currentEventTime = NoTimestamp;
var currentEventWipLanes = NoLanes;
var currentEventPendingLanes = NoLanes; // Dev only flag that tracks if passive effects are currently being flushed.
// We warn about state updates for unmounted components differently in this case.

var isFlushingPassiveEffects = false;
var focusedInstanceHandle = null;
var shouldFireAfterActiveInstanceBlur = false;
function getWorkInProgressRoot() {
  return workInProgressRoot;
}
function requestEventTime() {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    // We're inside React, so it's fine to read the actual time.
    return now();
  } // We're not inside React, so we may be in the middle of a browser event.


  if (currentEventTime !== NoTimestamp) {
    // Use the same start time for all updates until we enter React again.
    return currentEventTime;
  } // This is the first update since React yielded. Compute a new start time.


  currentEventTime = now();
  return currentEventTime;
}
function requestUpdateLane(fiber) {
  // Special cases
  var mode = fiber.mode;

  if ((mode & BlockingMode) === NoMode) {
    return SyncLane;
  } else if ((mode & ConcurrentMode) === NoMode) {
    return getCurrentPriorityLevel() === ImmediatePriority$1 ? SyncLane : SyncBatchedLane;
  } // The algorithm for assigning an update to a lane should be stable for all
  // updates at the same priority within the same event. To do this, the inputs
  // to the algorithm must be the same. For example, we use the `renderLanes`
  // to avoid choosing a lane that is already in the middle of rendering.
  //
  // However, the "included" lanes could be mutated in between updates in the
  // same event, like if you perform an update inside `flushSync`. Or any other
  // code path that might call `prepareFreshStack`.
  //
  // The trick we use is to cache the first of each of these inputs within an
  // event. Then reset the cached values once we can be sure the event is over.
  // Our heuristic for that is whenever we enter a concurrent work loop.
  //
  // We'll do the same for `currentEventPendingLanes` below.


  if (currentEventWipLanes === NoLanes) {
    currentEventWipLanes = workInProgressRootIncludedLanes;
  }

  var isTransition = requestCurrentTransition() !== NoTransition;

  if (isTransition) {
    if (currentEventPendingLanes !== NoLanes) {
      currentEventPendingLanes = mostRecentlyUpdatedRoot !== null ? mostRecentlyUpdatedRoot.pendingLanes : NoLanes;
    }

    return findTransitionLane(currentEventWipLanes, currentEventPendingLanes);
  } // TODO: Remove this dependency on the Scheduler priority.
  // To do that, we're replacing it with an update lane priority.


  var schedulerPriority = getCurrentPriorityLevel(); // The old behavior was using the priority level of the Scheduler.
  // This couples React to the Scheduler internals, so we're replacing it
  // with the currentUpdateLanePriority above. As an example of how this
  // could be problematic, if we're not inside `Scheduler.runWithPriority`,
  // then we'll get the priority of the current running Scheduler task,
  // which is probably not what we want.

  var lane;

  if ( // TODO: Temporary. We're removing the concept of discrete updates.
  (executionContext & DiscreteEventContext) !== NoContext && schedulerPriority === UserBlockingPriority$2) {
    lane = findUpdateLane(InputDiscreteLanePriority, currentEventWipLanes);
  } else {
    var schedulerLanePriority = schedulerPriorityToLanePriority(schedulerPriority);

    lane = findUpdateLane(schedulerLanePriority, currentEventWipLanes);
  }

  return lane;
}

function requestRetryLane(fiber) {
  // This is a fork of `requestUpdateLane` designed specifically for Suspense
  // "retries" ??? a special update that attempts to flip a Suspense boundary
  // from its placeholder state to its primary/resolved state.
  // Special cases
  var mode = fiber.mode;

  if ((mode & BlockingMode) === NoMode) {
    return SyncLane;
  } else if ((mode & ConcurrentMode) === NoMode) {
    return getCurrentPriorityLevel() === ImmediatePriority$1 ? SyncLane : SyncBatchedLane;
  } // See `requestUpdateLane` for explanation of `currentEventWipLanes`


  if (currentEventWipLanes === NoLanes) {
    currentEventWipLanes = workInProgressRootIncludedLanes;
  }

  return findRetryLane(currentEventWipLanes);
}

function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  checkForNestedUpdates();
  warnAboutRenderPhaseUpdatesInDEV(fiber);
  var root = markUpdateLaneFromFiberToRoot(fiber, lane);

  if (root === null) {
    warnAboutUpdateOnUnmountedFiberInDEV(fiber);
    return null;
  } // Mark that the root has a pending update.


  markRootUpdated(root, lane, eventTime);

  if (root === workInProgressRoot) {
    // Received an update to a tree that's in the middle of rendering. Mark
    // that there was an interleaved update work on this root. Unless the
    // `deferRenderPhaseUpdateToNextBatch` flag is off and this is a render
    // phase update. In that case, we don't treat render phase updates as if
    // they were interleaved, for backwards compat reasons.
    {
      workInProgressRootUpdatedLanes = mergeLanes(workInProgressRootUpdatedLanes, lane);
    }

    if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
      // The root already suspended with a delay, which means this render
      // definitely won't finish. Since we have a new update, let's mark it as
      // suspended now, right before marking the incoming update. This has the
      // effect of interrupting the current render and switching to the update.
      // TODO: Make sure this doesn't override pings that happen while we've
      // already started rendering.
      markRootSuspended$1(root, workInProgressRootRenderLanes);
    }
  } // TODO: requestUpdateLanePriority also reads the priority. Pass the
  // priority as an argument to that function and this one.


  var priorityLevel = getCurrentPriorityLevel();

  if (lane === SyncLane) {
    if ( // Check if we're inside unbatchedUpdates
    (executionContext & LegacyUnbatchedContext) !== NoContext && // Check if we're not already rendering
    (executionContext & (RenderContext | CommitContext)) === NoContext) {
      // Register pending interactions on the root to avoid losing traced interaction data.
      schedulePendingInteractions(root, lane); // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
      // root inside of batchedUpdates should be synchronous, but layout updates
      // should be deferred until the end of the batch.

      performSyncWorkOnRoot(root);
    } else {
      ensureRootIsScheduled(root, eventTime);
      schedulePendingInteractions(root, lane);

      if (executionContext === NoContext) {
        // Flush the synchronous work now, unless we're already working or inside
        // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
        // scheduleCallbackForFiber to preserve the ability to schedule a callback
        // without immediately flushing it. We only do this for user-initiated
        // updates, to preserve historical behavior of legacy mode.
        resetRenderTimer();
        flushSyncCallbackQueue();
      }
    }
  } else {
    // Schedule a discrete update but only if it's not Sync.
    if ((executionContext & DiscreteEventContext) !== NoContext && ( // Only updates at user-blocking priority or greater are considered
    // discrete, even inside a discrete event.
    priorityLevel === UserBlockingPriority$2 || priorityLevel === ImmediatePriority$1)) {
      // This is the result of a discrete event. Track the lowest priority
      // discrete update per root so we can flush them early, if needed.
      if (rootsWithPendingDiscreteUpdates === null) {
        rootsWithPendingDiscreteUpdates = new Set([root]);
      } else {
        rootsWithPendingDiscreteUpdates.add(root);
      }
    } // Schedule other updates after in case the callback is sync.


    ensureRootIsScheduled(root, eventTime);
    schedulePendingInteractions(root, lane);
  } // We use this when assigning a lane for a transition inside
  // `requestUpdateLane`. We assume it's the same as the root being updated,
  // since in the common case of a single root app it probably is. If it's not
  // the same root, then it's not a huge deal, we just might batch more stuff
  // together more than necessary.


  mostRecentlyUpdatedRoot = root;
} // This is split into a separate function so we can mark a fiber with pending
// work without treating it as a typical update that originates from an event;
// e.g. retrying a Suspense boundary isn't an update, but it does schedule work
// on a fiber.

function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
  // Update the source fiber's lanes
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  var alternate = sourceFiber.alternate;

  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  {
    if (alternate === null && (sourceFiber.flags & (Placement | Hydrating)) !== NoFlags) {
      warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
    }
  } // Walk the parent path to the root and update the child expiration time.


  var node = sourceFiber;
  var parent = sourceFiber.return;

  while (parent !== null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;

    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    } else {
      {
        if ((parent.flags & (Placement | Hydrating)) !== NoFlags) {
          warnAboutUpdateOnNotYetMountedFiberInDEV(sourceFiber);
        }
      }
    }

    node = parent;
    parent = parent.return;
  }

  if (node.tag === HostRoot) {
    var root = node.stateNode;
    return root;
  } else {
    return null;
  }
} // Use this function to schedule a task for a root. There's only one task per
// root;