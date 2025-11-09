import generate from '@babel/generator';
import * as t from '@babel/types';
import { parse } from '@babel/parser';
import { convertJsonToGsapString } from './transpileToString';

/**
 * Timeline Data Structure Interface (reused from transpileToString)
 */
interface TweenParameters {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number | object;
  [key: string]: any;
}

interface Tween {
  method: 'to' | 'from' | 'fromTo' | 'set';
  target_selector: string;
  start_properties?: Record<string, any>;
  end_properties?: Record<string, any>;
  parameters?: TweenParameters;
  position?: string | number;
}

interface TimelineSettings {
  repeat?: number;
  yoyo?: boolean;
  repeatDelay?: number;
  paused?: boolean;
  [key: string]: any;
}

interface TimelineData {
  settings?: TimelineSettings;
  tweens: Tween[];
}

interface GenerateReactComponentOptions {
  componentName?: string;
  containerSelector?: string;
}

/**
 * Generates a React component with GSAP animation from timeline data
 * @param timelineData - The timeline data object containing settings and tweens
 * @param options - Optional configuration for component generation
 * @returns A string containing the complete React component code
 */
export function generateReactComponent(
  timelineData: TimelineData,
  options: GenerateReactComponentOptions = {}
): string {
  const {
    componentName = 'MyAnimation',
    containerSelector = '.animation-container'
  } = options;

  // Convert timeline data to GSAP code string
  const gsapCodeString = convertJsonToGsapString(timelineData);

  // Parse the GSAP code into AST statements
  const gsapAst = parse(gsapCodeString, {
    sourceType: 'module',
    plugins: []
  });

  // Build the AST for the React component
  const ast = t.file(
    t.program([
      // Import useLayoutEffect from 'react'
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('useLayoutEffect'),
            t.identifier('useLayoutEffect')
          )
        ],
        t.stringLiteral('react')
      ),

      // Import gsap from 'gsap'
      t.importDeclaration(
        [
          t.importDefaultSpecifier(t.identifier('gsap'))
        ],
        t.stringLiteral('gsap')
      ),

      // Export function MyAnimation() {...}
      t.exportNamedDeclaration(
        t.functionDeclaration(
          t.identifier(componentName),
          [],
          t.blockStatement([
            // useLayoutEffect(() => { ... }, [])
            t.expressionStatement(
              t.callExpression(
                t.identifier('useLayoutEffect'),
                [
                  // Arrow function: () => { GSAP code here }
                  t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                      // Add all the GSAP statements from the parsed code
                      ...gsapAst.program.body
                    ])
                  ),
                  // Empty dependency array []
                  t.arrayExpression([])
                ]
              )
            ),

            // return <div className="animation-container"></div>
            t.returnStatement(
              t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier('div'),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier('className'),
                      t.stringLiteral(containerSelector.replace('.', ''))
                    )
                  ],
                  false
                ),
                t.jsxClosingElement(t.jsxIdentifier('div')),
                [],
                false
              )
            )
          ])
        ),
        []
      )
    ])
  );

  // Generate the code from the AST
  const output = generate(ast, {
    retainLines: false,
    compact: false,
    concise: false,
    comments: true
  });

  return output.code;
}

/**
 * Generates a React component with GSAP animation and a ref-based approach
 * This version uses useRef to target elements within the component
 * @param timelineData - The timeline data object containing settings and tweens
 * @param options - Optional configuration for component generation
 * @returns A string containing the complete React component code
 */
export function generateReactComponentWithRef(
  timelineData: TimelineData,
  options: GenerateReactComponentOptions = {}
): string {
  const {
    componentName = 'MyAnimation',
    containerSelector = '.animation-container'
  } = options;

  // Convert timeline data to GSAP code string
  const gsapCodeString = convertJsonToGsapString(timelineData);

  // Parse the GSAP code into AST statements
  const gsapAst = parse(gsapCodeString, {
    sourceType: 'module',
    plugins: []
  });

  // Build the AST for the React component with useRef
  const ast = t.file(
    t.program([
      // Import useLayoutEffect and useRef from 'react'
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('useLayoutEffect'),
            t.identifier('useLayoutEffect')
          ),
          t.importSpecifier(
            t.identifier('useRef'),
            t.identifier('useRef')
          )
        ],
        t.stringLiteral('react')
      ),

      // Import gsap from 'gsap'
      t.importDeclaration(
        [
          t.importDefaultSpecifier(t.identifier('gsap'))
        ],
        t.stringLiteral('gsap')
      ),

      // Export function MyAnimation() {...}
      t.exportNamedDeclaration(
        t.functionDeclaration(
          t.identifier(componentName),
          [],
          t.blockStatement([
            // const containerRef = useRef(null)
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier('containerRef'),
                t.callExpression(
                  t.identifier('useRef'),
                  [t.nullLiteral()]
                )
              )
            ]),

            // useLayoutEffect(() => { ... }, [])
            t.expressionStatement(
              t.callExpression(
                t.identifier('useLayoutEffect'),
                [
                  // Arrow function: () => { GSAP code with ctx }
                  t.arrowFunctionExpression(
                    [],
                    t.blockStatement([
                      // const ctx = gsap.context(() => { GSAP code }, containerRef)
                      t.variableDeclaration('const', [
                        t.variableDeclarator(
                          t.identifier('ctx'),
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('gsap'),
                              t.identifier('context')
                            ),
                            [
                              t.arrowFunctionExpression(
                                [],
                                t.blockStatement([
                                  ...gsapAst.program.body
                                ])
                              ),
                              t.identifier('containerRef')
                            ]
                          )
                        )
                      ]),

                      // return () => ctx.revert()
                      t.returnStatement(
                        t.arrowFunctionExpression(
                          [],
                          t.callExpression(
                            t.memberExpression(
                              t.identifier('ctx'),
                              t.identifier('revert')
                            ),
                            []
                          )
                        )
                      )
                    ])
                  ),
                  // Empty dependency array []
                  t.arrayExpression([])
                ]
              )
            ),

            // return <div ref={containerRef} className="animation-container"></div>
            t.returnStatement(
              t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier('div'),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier('ref'),
                      t.jsxExpressionContainer(t.identifier('containerRef'))
                    ),
                    t.jsxAttribute(
                      t.jsxIdentifier('className'),
                      t.stringLiteral(containerSelector.replace('.', ''))
                    )
                  ],
                  false
                ),
                t.jsxClosingElement(t.jsxIdentifier('div')),
                [],
                false
              )
            )
          ])
        ),
        []
      )
    ])
  );

  // Generate the code from the AST
  const output = generate(ast, {
    retainLines: false,
    compact: false,
    concise: false,
    comments: true
  });

  return output.code;
}

