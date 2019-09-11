import React, {Fragment, useState} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';

import {IconLabel} from './IconLabel/IconLabel';
import {ArrowDropDown, ArrowRight} from '@material-ui/icons';

const style = theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    nodeWithChild: {
        border: 'none',
        padding: 0,
        margin: '0.25rem 0',
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        background: 'transparent'
    },
    nodeWithChildArrow: {
        color: theme.palette.ui.gamma
    },
    simpleNode: {
        padding: '0.5rem 0 0.5rem 0',
        width: '100%',
        textAlign: 'left'
    },
    selected: {
        backgroundColor: theme.palette.brand.alpha,
        '& span': {
            color: theme.palette.background.paper
        }
    },
    childContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%'
    }
});

const TreeViewCmp = ({tree, onNodeClick, classes}) => {
    // By default everything is closed
    const [openedNodes, setOpenedNode] = useState([]);

    function generateLevelJSX(level, deep) {
        return level.map(node => {
            const nodeIsOpen = Boolean(openedNodes.includes(node));

            const handleNodeClick = e => {
                if (nodeIsOpen) {
                    setOpenedNode(openedNodes.filter(n => n !== node));
                } else {
                    setOpenedNode([...openedNodes, node]);
                }

                onNodeClick(node, e);
            };

            if (node.childs && node.childs.length !== 0) {
                const Arrow = nodeIsOpen || node.opened ? ArrowDropDown : ArrowRight;
                const Childs = nodeIsOpen || node.opened ? generateLevelJSX(node.childs, deep + 1) : <></>;

                return (
                    <Fragment key={level.id + node.id}>
                        <button type="button" className={classes.nodeWithChild} onClick={handleNodeClick}>
                            <Arrow className={classes.nodeWithChildArrow} color="secondary"/>
                            <span>
                                <IconLabel label={node.label} iconURL={node.iconURL}/>
                            </span>
                        </button>
                        <div className={classes.childContainer}>
                            {Childs}
                        </div>
                    </Fragment>
                );
            }

            return (
                <div key={level.id + node.id}
                     tabIndex="0"
                     style={{paddingLeft: `calc(${deep}rem + 20px)`}}
                     className={`${classes.simpleNode} ${node.selected ? classes.selected : ''}`}
                     onKeyPress={event => {
                         if (event.key === 'Enter') {
                             handleNodeClick(event);
                         }
                     }}
                     onClick={handleNodeClick}
                >
                    <IconLabel label={node.label} iconURL={node.iconURL}/>
                </div>
            );
        });
    }

    return (
        <div className={classes.container}>
            {generateLevelJSX(tree, 0)}
        </div>
    );
};

TreeViewCmp.defaultProps = {
    onNodeClick: () => {}
};

TreeViewCmp.propTypes = {
    tree: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        iconURL: PropTypes.string,
        childs: PropTypes.arrayOf(PropTypes.object)
    })).isRequired,
    onNodeClick: PropTypes.func,
    classes: PropTypes.object.isRequired
};

export const TreeView = withStyles(style)(TreeViewCmp);

TreeView.displayName = 'TreeView';