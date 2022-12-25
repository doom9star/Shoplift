parent;
    }

    return null;
}

/**
 * Updates the "modified" flags of given loop conditions with given modifiers.
 * @param {LoopConditionInfo[]} conditions The loop conditions to be updated.
 * @param {eslint-scope.Reference[]} modifiers The references to update.
 * @returns {void}
 */
function updateModifiedFlag(conditions, modifiers) {

    for (let i = 0; i < conditions.length; ++i) {
        const condition = conditions[i];

        for (let j = 0; !condition.modified && j < modifiers.length; ++j) {
            const modifier = modifiers[j];
            let funcNode, funcVar;

            /*
             * Besides checking for the condition being in the loop, we want to
             * check the function that this modifier is belonging to is called
             * in the loop.
             * FIXME: This should probably be extracted to a function.
             */
            const inLoop = condition.isInLoop(modifier) || Boolean(
                (funcNode = getEncloseFunctionDeclaration(modifier)) &&
                (funcVar = astUtils.getVariableByName(modifier.from.upper, funcNode.id.name)) &&
                funcVar.references.some(condition.isInLoop)
            );

            condition.modified = inLoop;
        }
    }
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shar